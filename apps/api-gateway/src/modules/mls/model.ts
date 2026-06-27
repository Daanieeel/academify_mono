import { t } from 'elysia';

export const PostMlsDevicesSchema = t.Object({
  label: t.Optional(t.String()),
  identity_pubkey: t.String({ minLength: 1 }),
});

export const PostMlsKeyPackagesSchema = t.Object({
  device_id: t.String({ format: 'uuid' }),
  key_package_bytes: t.String({ minLength: 1 }),
});

export const ConsumeMlsKeyPackagesSchema = t.Object({
  user_id: t.String({ minLength: 1 }),
});

export const PostMlsGroupsSchema = t.Object({
  chat_id: t.String({ minLength: 1 }),
  mls_group_id: t.String({ minLength: 1 }),
  cipher_suite: t.String({ minLength: 1 }),
  device_id: t.String({ format: 'uuid' }),
});

export const PostMlsGroupsMembersParamsSchema = t.Object({
  chatId: t.String({ minLength: 1 }),
});

export const PostMlsGroupsMembersBodySchema = t.Object({
  new_member_user_id: t.String({ minLength: 1 }),
  new_member_device_id: t.String({ format: 'uuid' }),
  leaf_index: t.Integer({ minimum: 0 }),
  new_epoch: t.Integer({ minimum: 0 }),
  welcome_bytes: t.String({ minLength: 1 }),
});

export const MlsGroupsChatIdParamsSchema = t.Object({
  chatId: t.String({ minLength: 1 }),
});
