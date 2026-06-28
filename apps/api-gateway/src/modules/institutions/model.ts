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
