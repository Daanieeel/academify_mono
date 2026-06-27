import { Elysia } from 'elysia';
import { authMiddleware } from '../../plugins/auth';
import { MessagesService } from './service';
import { MessageIdParamsSchema, SendMessageSchema } from './model';

export const messagesRoutes = new Elysia()
  .use(authMiddleware)
  .get(
    '/messages/:id',
    ({ params, userId }) => {
      return MessagesService.getMessage(userId, params.id);
    },
    { params: MessageIdParamsSchema },
  )
  .post(
    '/messages',
    ({ body, userId }) => {
      return MessagesService.sendMessage(
        userId,
        body.message_id,
        body.chat_id,
        body.sender_device_id,
        body.mls_epoch,
        body.ciphertext,
        body.content_type,
      );
    },
    {
      body: SendMessageSchema,
    },
  );
