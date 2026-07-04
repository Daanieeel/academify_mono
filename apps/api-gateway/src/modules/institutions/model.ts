import { t } from 'elysia';

export const UpdateInstitutionSettingsSchema = t.Object({
  features: t.Optional(t.Record(t.String(), t.Boolean())),
  roles: t.Optional(
    t.Record(
      t.String(),
      t.Object({
        displayName: t.Optional(t.String()),
        rank: t.Optional(t.Number()),
        inherits: t.Optional(t.Array(t.String())),
        permissions: t.Optional(t.Record(t.String(), t.Boolean())),
      }),
    ),
  ),
  applyPreset: t.Optional(t.String()),
});

export const GenerateUploadUrlSchema = t.Object({
  assetType: t.Union([t.Literal('avatar'), t.Literal('banner')]),
  contentType: t.String(),
});

export const UpdateInstitutionProfileSchema = t.Object({
  avatarUrl: t.Optional(t.String()),
  bannerUrl: t.Optional(t.String()),
  address: t.Optional(t.String()),
  telephone: t.Optional(t.String()),
  description: t.Optional(t.String()),
});
