import { t } from 'elysia';

export const MessageIdParamsSchema = t.Object({
  id: t.String({ format: 'uuid' }),
});

export const SendMessageSchema = t.Object({
  message_id: t.String({ format: 'uuid' }),
  chat_id: t.String({ minLength: 1 }),
  sender_device_id: t.String({ minLength: 1 }),
  mls_epoch: t.Integer({ minimum: 0 }),
  ciphertext: t.String({ minLength: 1 }),
  content_type: t.String({ minLength: 1 }),
});
