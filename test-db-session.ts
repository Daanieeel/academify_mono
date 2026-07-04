import { db } from './apps/api-gateway/src/env.ts';
import { session } from '@repo/database';
import { eq } from 'drizzle-orm';

async function test() {
  const sessions = await db.select().from(session).limit(1);
  console.log('DB Session:', sessions[0]);
}
test();
