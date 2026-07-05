import { Elysia, t } from 'elysia';
import { authMiddleware } from '../../plugins/auth';
import { UsersService } from './service';
import { AppError } from '../../plugins/error';

export const usersRoutes = new Elysia()
  .use(authMiddleware)
  .get('/me/profiles', ({ userId }) => {
    return UsersService.getProfiles(userId);
  })
  .post(
    '/',
    ({ user, body }) => {
      // Permission enforcement: AdminJoe can only manage accounts if he has the flag
      if (!user.canManageAccounts) {
        throw new AppError(
          403,
          'FORBIDDEN',
          'You do not have permission to manage accounts.',
        );
      }

      // AdminJoe can only manage accounts that have the main institution id set to the same main institution id
      if (user.mainInstitutionId !== body.mainInstitutionId) {
        throw new AppError(
          403,
          'FORBIDDEN',
          'You can only manage accounts for your own main institution.',
        );
      }

      // TODO: Create/manage account logic here...
      return { success: true };
    },
    {
      body: t.Object({
        mainInstitutionId: t.String(),
        name: t.String(),
        email: t.String(),
      }),
    },
  );
