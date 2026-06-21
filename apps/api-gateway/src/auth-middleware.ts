import { eq } from 'drizzle-orm';
import { Elysia } from 'elysia';
import { auth } from '@repo/auth';
import { db, profiles } from '@repo/database';

// Same auth rules across REST + WS (both go through this derive, since a WS
// upgrade is itself a normal HTTP request that runs the full lifecycle).
// Institution context comes from `profiles`, not the auth session itself —
// auth identity and institutional profile are deliberately separate tables.
export const authMiddleware = new Elysia({ name: 'auth-middleware' }).derive(
  { as: 'scoped' },
  async ({ request, status }) => {
    const result = await auth.api.getSession({ headers: request.headers });

    if (!result) {
      return status(401, { error: 'unauthorized' });
    }

    const [profile] = await db
      .select({ institutionId: profiles.institutionId })
      .from(profiles)
      .where(eq(profiles.userId, result.user.id));

    return {
      userId: result.user.id,
      institutionId: profile?.institutionId ?? null,
    };
  },
);
