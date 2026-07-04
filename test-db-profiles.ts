import { db } from './apps/api-gateway/src/env.ts';
import { profiles, institutions, session, user } from '@repo/database';
import { eq, and } from 'drizzle-orm';

async function test() {
  const users = await db.select().from(user).limit(1);
  if (!users.length) {return console.log('No users');}
  const userId = users[0].id;
  console.log('Found user:', userId);

  const res = await db
    .select({
      id: profiles.id,
      institution_id: institutions.id,
      institution_name: institutions.name,
      display_name: profiles.displayName,
      role: profiles.role,
      class_name: profiles.className,
    })
    .from(profiles)
    .innerJoin(institutions, eq(institutions.id, profiles.institutionId))
    .where(eq(profiles.userId, userId));

  console.log('Profiles for user:', res);
}
test();
