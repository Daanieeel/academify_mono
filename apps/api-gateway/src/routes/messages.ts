import { and, eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { chatMembers, db, messages } from '@repo/database';
import { jobPayloadSchema } from '@repo/sync-protocol';

import { authMiddleware } from '../auth-middleware';
import { enqueueJob } from '../queue';

export const messagesRoutes = new Elysia()
  .use(authMiddleware)
  .get(
    '/messages/:id',
    async ({ params, userId, status }) => {
      const [message] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, params.id));

      if (!message) {
        return status(404, { error: 'message not found' });
      }

      const [membership] = await db
        .select({ userId: chatMembers.userId })
        .from(chatMembers)
        .where(
          and(
            eq(chatMembers.chatId, message.chatId),
            eq(chatMembers.userId, userId),
          ),
        );

      if (!membership) {
        return status(403, { error: 'not a member of this chat' });
      }

      return {
        message_id: message.id,
        chat_id: message.chatId,
        sender_user_id: message.senderUserId,
        sender_device_id: message.senderDeviceId,
        mls_epoch: message.mlsEpoch,
        ciphertext: message.ciphertext.toString('base64url'),
        content_type: message.contentType,
        deleted: message.deletedAt !== null,
      };
    },
    { params: t.Object({ id: t.String({ format: 'uuid' }) }) },
  )
  .post(
    '/messages',
    async ({ body, userId, status }) => {
      const [membership] = await db
        .select({ userId: chatMembers.userId })
        .from(chatMembers)
        .where(
          and(
            eq(chatMembers.chatId, body.chat_id),
            eq(chatMembers.userId, userId),
            eq(chatMembers.state, 'active'),
          ),
        );

      if (!membership) {
        return status(403, { error: 'not a member of this chat' });
      }

      const payload = jobPayloadSchema.parse({
        command: 'SEND_MESSAGE',
        message_id: body.message_id,
        chat_id: body.chat_id,
        sender_user_id: userId,
        sender_device_id: body.sender_device_id,
        mls_epoch: body.mls_epoch,
        ciphertext: body.ciphertext,
        content_type: body.content_type,
      });

      await enqueueJob(payload);

      return { accepted: true, message_id: body.message_id };
    },
    {
      body: t.Object({
        message_id: t.String({ format: 'uuid' }),
        chat_id: t.String({ minLength: 1 }),
        sender_device_id: t.String({ minLength: 1 }),
        mls_epoch: t.Integer({ minimum: 0 }),
        ciphertext: t.String({ minLength: 1 }),
        content_type: t.String({ minLength: 1 }),
      }),
    },
  );
