import { t } from 'elysia';

export const UpdateAvatarSchema = t.Object({
  background_color: t.String({
    pattern: '^#[0-9A-Fa-f]{6}(,#[0-9A-Fa-f]{6})?$',
  }),
  emoji: t.String({ minLength: 1, maxLength: 32 }),
});

export const CreateChatSchema = t.Object({
  peer_user_id: t.String({ minLength: 1 }),
});

export const ChatIdParamsSchema = t.Object({
  id: t.String({ minLength: 1 }),
});

export const GetChatMessagesQuerySchema = t.Object({
  before_cursor: t.Optional(t.String()),
  limit: t.Optional(t.Integer({ minimum: 1, maximum: 200 })),
});
