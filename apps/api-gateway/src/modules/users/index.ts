import { Elysia } from 'elysia';
import { authMiddleware } from '../../plugins/auth';
import { UsersService } from './service';

export const usersRoutes = new Elysia()
  .use(authMiddleware)
  .get('/me/profiles', ({ userId }) => {
    return UsersService.getProfiles(userId);
  });
