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

const REALISTIC_SCHOOLS = [
  { name: 'Goethe-Gymnasium', region: 'Berlin', type: 'Gymnasium' },
  { name: 'Albert-Einstein-Schule', region: 'Hessen', type: 'Gesamtschule' },
  {
    name: 'Schiller-Gymnasium',
    region: 'Baden-Württemberg',
    type: 'Gymnasium',
  },
  { name: 'Karl-Marx-Schule', region: 'Sachsen', type: 'Oberschule' },
  {
    name: 'Heinrich-Heine-Gesamtschule',
    region: 'Nordrhein-Westfalen',
    type: 'Gesamtschule',
  },
  {
    name: 'Sophie-Scholl-Schule',
    region: 'Berlin',
    type: 'Integrierte Sekundarschule',
  },
  {
    name: 'Johannes-Gutenberg-Realschule',
    region: 'Rheinland-Pfalz',
    type: 'Realschule',
  },
  { name: 'Käthe-Kollwitz-Gymnasium', region: 'Thüringen', type: 'Gymnasium' },
  {
    name: 'Alexander-von-Humboldt-Gymnasium',
    region: 'Bayern',
    type: 'Gymnasium',
  },
  {
    name: 'Lise-Meitner-Gymnasium',
    region: 'Niedersachsen',
    type: 'Gymnasium',
  },
  { name: 'Hermann-Hesse-Schule', region: 'Hessen', type: 'Realschule' },
  { name: 'Thomas-Mann-Gymnasium', region: 'Sachsen', type: 'Gymnasium' },
  {
    name: 'Wilhelm-Raabe-Schule',
    region: 'Niedersachsen',
    type: 'Gesamtschule',
  },
  {
    name: 'Marie-Curie-Gymnasium',
    region: 'Sachsen-Anhalt',
    type: 'Gymnasium',
  },
  {
    name: 'Astrid-Lindgren-Grundschule',
    region: 'Nordrhein-Westfalen',
    type: 'Grundschule',
  },
  {
    name: 'Bettina-von-Arnim-Gesamtschule',
    region: 'Berlin',
    type: 'Gesamtschule',
  },
  {
    name: 'Max-Planck-Gymnasium',
    region: 'Baden-Württemberg',
    type: 'Gymnasium',
  },
  { name: 'Erich-Kästner-Realschule', region: 'Hessen', type: 'Realschule' },
  {
    name: 'Freiherr-vom-Stein-Gymnasium',
    region: 'Nordrhein-Westfalen',
    type: 'Gymnasium',
  },
  {
    name: 'Geschwister-Scholl-Gymnasium',
    region: 'Sachsen',
    type: 'Gymnasium',
  },
  { name: 'Bertha-von-Suttner-Schule', region: 'Bremen', type: 'Gesamtschule' },
  { name: 'Pestalozzi-Schule', region: 'Sachsen-Anhalt', type: 'Förderschule' },
  {
    name: 'Gottfried-Wilhelm-Leibniz-Gymnasium',
    region: 'Brandenburg',
    type: 'Gymnasium',
  },
  {
    name: 'Anne-Frank-Realschule',
    region: 'Baden-Württemberg',
    type: 'Realschule',
  },
  { name: 'Immanuel-Kant-Gymnasium', region: 'Hamburg', type: 'Gymnasium' },
  {
    name: 'Gewerbliche Schule',
    region: 'Baden-Württemberg',
    type: 'Berufsschule',
  },
  {
    name: 'Kaufmännische Berufsschule',
    region: 'Bayern',
    type: 'Berufsschule',
  },
  {
    name: 'Carl-Friedrich-Gauß-Gymnasium',
    region: 'Saarland',
    type: 'Gymnasium',
  },
  {
    name: 'Johannes-Kepler-Gymnasium',
    region: 'Baden-Württemberg',
    type: 'Gymnasium',
  },
  { name: 'Rosa-Luxemburg-Gymnasium', region: 'Berlin', type: 'Gymnasium' },
  {
    name: 'Friedrich-Ebert-Gymnasium',
    region: 'Rheinland-Pfalz',
    type: 'Gymnasium',
  },
  { name: 'Fichte-Gymnasium', region: 'Baden-Württemberg', type: 'Gymnasium' },
  { name: 'Helene-Lange-Gymnasium', region: 'Hamburg', type: 'Gymnasium' },
  {
    name: 'Heinrich-Böll-Gesamtschule',
    region: 'Nordrhein-Westfalen',
    type: 'Gesamtschule',
  },
  { name: 'Kaiserin-Friedrich-Gymnasium', region: 'Hessen', type: 'Gymnasium' },
  { name: 'Albrecht-Dürer-Gymnasium', region: 'Bayern', type: 'Gymnasium' },
  { name: 'Martin-Luther-Schule', region: 'Hessen', type: 'Realschule' },
  {
    name: 'Robert-Bosch-Schule',
    region: 'Baden-Württemberg',
    type: 'Gesamtschule',
  },
  {
    name: 'Kopernikus-Gymnasium',
    region: 'Nordrhein-Westfalen',
    type: 'Gymnasium',
  },
  { name: 'Walther-Rathenau-Gymnasium', region: 'Berlin', type: 'Gymnasium' },
  {
    name: 'Theodor-Heuss-Gymnasium',
    region: 'Baden-Württemberg',
    type: 'Gymnasium',
  },
  {
    name: 'Albert-Schweitzer-Gymnasium',
    region: 'Thüringen',
    type: 'Gymnasium',
  },
  {
    name: 'Claus-von-Stauffenberg-Schule',
    region: 'Hessen',
    type: 'Gesamtschule',
  },
  {
    name: 'Georg-Büchner-Gymnasium',
    region: 'Nordrhein-Westfalen',
    type: 'Gymnasium',
  },
  {
    name: 'Otto-Hahn-Gymnasium',
    region: 'Baden-Württemberg',
    type: 'Gymnasium',
  },
  { name: 'König-Karlmann-Gymnasium', region: 'Bayern', type: 'Gymnasium' },
  { name: 'Lessing-Gymnasium', region: 'Sachsen', type: 'Gymnasium' },
  {
    name: 'Christian-Morgenstern-Schule',
    region: 'Berlin',
    type: 'Grundschule',
  },
  { name: 'Humboldt-Gymnasium', region: 'Thüringen', type: 'Gymnasium' },
  {
    name: 'Werner-von-Siemens-Gymnasium',
    region: 'Sachsen-Anhalt',
    type: 'Gymnasium',
  },
];

const MAIN_SCHOOL = REALISTIC_SCHOOLS[0]!;
const INSTITUTION_SLUG = 'goethe-gymnasium';

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

function makeSlug(name: string, region: string) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${region.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

async function main() {
  console.log('Clearing database...');
  await db.execute(sql`
    DO $$ DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE '%drizzle%') LOOP
            EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
    END $$;
  `);

  console.log('Seeding 50 registry institutions...');
  for (const school of REALISTIC_SCHOOLS) {
    const slug =
      school === MAIN_SCHOOL
        ? INSTITUTION_SLUG
        : makeSlug(school.name, school.region);
    await db.execute(sql`
      INSERT INTO institution_registry (id, slug, display_name, type, region, country, backend_url)
      VALUES (
        gen_random_uuid(),
        ${slug},
        ${school.name},
        ${school.type},
        ${school.region},
        'Deutschland',
        'http://localhost:3001'
      )
    `);
  }

  const [institution] = await db
    .insert(institutions)
    .values({ slug: INSTITUTION_SLUG, displayName: MAIN_SCHOOL.name })
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
