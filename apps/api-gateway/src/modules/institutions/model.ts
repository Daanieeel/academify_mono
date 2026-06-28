import { t } from 'elysia';

export const UpdateInstitutionSettingsSchema = t.Object({
  features: t.Optional(t.Record(t.String(), t.Boolean())),
  permissions: t.Optional(
    t.Record(
      t.String(), // role
      t.Record(
        t.String(), // permission
        t.Boolean(),
      ),
    ),
  ),
  customRoles: t.Optional(
    t.Record(
      t.String(),
      t.Object({
        baseRole: t.String(),
        displayName: t.String(),
      }),
    ),
  ),
});
