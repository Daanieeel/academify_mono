import { eq } from 'drizzle-orm';
import { Elysia } from 'elysia';
import { auth } from '@repo/auth';
import { db, profiles } from '@repo/database';
import { AppError } from './error';

export const authMiddleware = new Elysia({ name: 'auth-middleware' }).derive(
  { as: 'scoped' },
  async ({ request }) => {
    const result = await auth.api.getSession({ headers: request.headers });

    if (!result) {
      throw new AppError(401, 'UNAUTHORIZED', 'unauthorized');
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
