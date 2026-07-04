import { Elysia } from 'elysia';
import { authMiddleware } from '../../plugins/auth';
import { InstitutionsService } from './service';
import {
  GenerateUploadUrlSchema,
  UpdateInstitutionProfileSchema,
  UpdateInstitutionSettingsSchema,
} from './model';

export const institutionsRoutes = new Elysia()
  .use(authMiddleware)
  .patch(
    '/institutions/:id/settings',
    ({ body, userId, params }) => {
      return InstitutionsService.updateSettings(
        userId,
        params.id,
        body.features,
        body.roles,
        body.applyPreset,
      );
    },
    {
      body: UpdateInstitutionSettingsSchema,
    },
  )
  .post(
    '/institutions/:id/assets/upload-url',
    ({ body, userId, params }) => {
      return InstitutionsService.generateUploadUrl(
        userId,
        params.id,
        body.assetType,
        body.contentType,
      );
    },
    {
      body: GenerateUploadUrlSchema,
    },
  )
  .patch(
    '/institutions/:id/profile',
    ({ body, userId, params }) => {
      return InstitutionsService.updateProfile(userId, params.id, body);
    },
    {
      body: UpdateInstitutionProfileSchema,
    },
  );
