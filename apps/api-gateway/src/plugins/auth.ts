import { eq, and } from 'drizzle-orm';
import { Elysia } from 'elysia';
import { auth, type AuthSession } from '@repo/auth';
import { db, profiles, institutions, session, user } from '@repo/database';
import { AppError } from './error';

export const authMiddleware = new Elysia({ name: 'auth-middleware' }).derive(
  { as: 'scoped' },
  async ({ request }) => {
    let result: AuthSession | null = await auth.api.getSession({
      headers: request.headers,
    });

    if (!result) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const sessionRecord = await db.query.session.findFirst({
          where: eq(session.token, token),
        });
        if (sessionRecord) {
          const userRecord = await db.query.user.findFirst({
            where: eq(user.id, sessionRecord.userId),
          });
          if (userRecord) {
            result = { session: sessionRecord, user: userRecord };
          }
        }
      }
    }

    if (!result) {
      throw new AppError(401, 'UNAUTHORIZED', 'unauthorized');
    }

    let institutionId: string | null = null;
    const requestedInstitutionId = request.headers.get('x-institution-id');

    if (requestedInstitutionId) {
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          requestedInstitutionId,
        );

      const [profile] = await db
        .select({ institutionId: profiles.institutionId })
        .from(profiles)
        .innerJoin(institutions, eq(institutions.id, profiles.institutionId))
        .where(
          and(
            eq(profiles.userId, result.user.id),
            isUuid
              ? eq(institutions.id, requestedInstitutionId)
              : eq(institutions.slug, requestedInstitutionId),
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
      user: result.user,
      institutionId,
    };
  },
);
