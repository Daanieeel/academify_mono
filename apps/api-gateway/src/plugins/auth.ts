import { eq, and } from 'drizzle-orm';
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

    let institutionId: string | null = null;
    const requestedInstitutionId = request.headers.get('x-institution-id');

    if (requestedInstitutionId) {
      const [profile] = await db
        .select({ institutionId: profiles.institutionId })
        .from(profiles)
        .where(
          and(
            eq(profiles.userId, result.user.id),
            eq(profiles.institutionId, requestedInstitutionId),
          ),
        );

      if (!profile) {
        throw new AppError(
          403,
          'FORBIDDEN',
          'User is not a member of this institution',
        );
      }
      institutionId = profile.institutionId;
    }

    return {
      userId: result.user.id,
      institutionId,
    };
  },
);
