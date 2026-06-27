import { t } from 'elysia';

export const PostReportsSchema = t.Object({
  reported_message_id: t.String({ format: 'uuid' }),
  chat_id: t.String({ minLength: 1 }),
  encrypted_package: t.String({ minLength: 1 }),
  compliance_key_version: t.Integer({ minimum: 1 }),
  content_hash: t.String({ minLength: 1 }),
});

export const ReportIdParamsSchema = t.Object({
  id: t.String({ format: 'uuid' }),
});
