import { eq, sql } from 'drizzle-orm';
import { auth } from '@repo/auth';
import { generateComplianceKeyPair } from '@repo/crypto';
import {
  classMemberships,
  classes,
  complianceKeys,
  db,
  institutions,
  profiles,
  roleBindings,
  user,
  account,
} from '@repo/database';

// Standalone dev-data seeder — not a test (no cleanup). Re-running it is
// cheap: if the demo institution already exists we assume it's already
// seeded and just reprint the login summary instead of duplicating rows.

const INSTITUTION_SLUG = 'demo-school';
const PASSWORD = 'Demo1234!';

type SeedUser = { username: string; displayName: string };

const ADMIN: SeedUser = { username: 'admin', displayName: 'Admin Admin' };
const TEACHER: SeedUser = { username: 'ms_weber', displayName: 'Frau Weber' };
const STUDENTS: SeedUser[] = [
  { username: 'alice', displayName: 'Alice Schmidt' },
  { username: 'bob', displayName: 'Bob Nguyen' },
  { username: 'clara', displayName: 'Clara Becker' },
  { username: 'david', displayName: 'David Hoffmann' },
];

async function createUser(seedUser: SeedUser, institutionId: string) {
  const ctx = await auth.$context;
  const hashed = await ctx.password.hash(PASSWORD);
  const id = crypto.randomUUID();

  const [created] = await db
    .insert(user)
    .values({
      id,
      name: seedUser.displayName,
      email: `${seedUser.username}@${INSTITUTION_SLUG}.invalid`,
      username: seedUser.username,
      displayUsername: seedUser.username,
      emailVerified: true,
    })
    .returning();

  await db.insert(account).values({
    id: `${id}-account`,
    accountId: id,
    providerId: 'credential',
    userId: created!.id,
    password: hashed,
  });

  await db.insert(profiles).values({
    userId: created!.id,
    institutionId,
    displayNameCiphertext: seedUser.displayName,
    keyVersion: 1,
  });

  return created!;
}

function printSummary(complianceKeyLine: string | null) {
  console.log('\n=== Academify demo data ===');
  console.log(`institution slug: ${INSTITUTION_SLUG}`);
  console.log(`password (all accounts): ${PASSWORD}\n`);
  console.log('username    role          ');
  console.log('----------  --------------');
  console.log(`${ADMIN.username.padEnd(10)}  admin`);
  console.log(`${TEACHER.username.padEnd(10)}  teacher (Klassenlehrerin 10a)`);
  for (const student of STUDENTS) {
    console.log(`${student.username.padEnd(10)}  student (10a)`);
  }
  if (complianceKeyLine) {
    console.log(
      '\nAdd this to apps/api-gateway/.env to review reports locally:',
    );
    console.log(complianceKeyLine);
  }
  console.log('');
}

async function main() {
  const [existing] = await db
    .select()
    .from(institutions)
    .where(eq(institutions.slug, INSTITUTION_SLUG));

  // Seed the registry so the mobile app can discover this school
  await db.execute(sql`
    INSERT INTO institution_registry (id, slug, display_name, type, region, country, backend_url)
    VALUES (
      gen_random_uuid(),
      ${INSTITUTION_SLUG},
      'Demo School',
      'Gymnasium',
      'Nordrhein-Westfalen',
      'Deutschland',
      'http://localhost:3001'
    )
    ON CONFLICT (slug) DO UPDATE SET backend_url = 'http://localhost:3001', type = 'Gymnasium', region = 'Nordrhein-Westfalen', country = 'Deutschland';
  `);

  if (existing) {
    console.log(`"${INSTITUTION_SLUG}" already seeded — skipping creation.`);
    printSummary(null);
    return;
  }

  const [institution] = await db
    .insert(institutions)
    .values({ slug: INSTITUTION_SLUG, displayName: 'Demo School' })
    .returning();
  const institutionId = institution!.id;

  const complianceKeyPair = generateComplianceKeyPair();
  await db.insert(complianceKeys).values({
    institutionId,
    keyVersion: 1,
    publicKey: complianceKeyPair.publicKey,
  });

  const admin = await createUser(ADMIN, institutionId);
  await db
    .insert(roleBindings)
    .values({ userId: admin.id, institutionId, role: 'admin' });

  const teacher = await createUser(TEACHER, institutionId);
  const students = [];
  for (const seedUser of STUDENTS) {
    students.push(await createUser(seedUser, institutionId));
  }

  const [cls] = await db
    .insert(classes)
    .values({ institutionId, name: '10a', headTeacherUserId: teacher.id })
    .returning();
  await db.insert(classMemberships).values([
    { classId: cls!.id, userId: teacher.id, role: 'teacher' },
    ...students.map((student) => ({
      classId: cls!.id,
      userId: student.id,
      role: 'student' as const,
    })),
  ]);

  printSummary(
    `COMPLIANCE_PRIVATE_KEY=${complianceKeyPair.privateKey.toString('base64url')}`,
  );
}

await main();
process.exit(0);
