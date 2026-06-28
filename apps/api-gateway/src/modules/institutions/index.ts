import { Elysia } from 'elysia';
import { authMiddleware } from '../../plugins/auth';
import { InstitutionsService } from './service';
import { UpdateInstitutionSettingsSchema } from './model';

export const institutionsRoutes = new Elysia().use(authMiddleware).patch(
  '/institutions/:id/settings',
  ({ body, userId, params }) => {
    return InstitutionsService.updateSettings(
      userId,
      params.id,
      body.features,
      body.permissions,
      body.customRoles,
    );
  },
  {
    body: UpdateInstitutionSettingsSchema,
  },
);
