import { Elysia } from 'elysia';
import { authMiddleware } from '../../plugins/auth';
import { ChatsService } from './service';
import {
  ChatIdParamsSchema,
  CreateChatSchema,
  GetChatMessagesQuerySchema,
  UpdateAvatarSchema,
} from './model';

export const chatsRoutes = new Elysia()
  .use(authMiddleware)
  .get('/me', ({ userId, institutionId }) => {
    return ChatsService.getMe(userId, institutionId);
  })
  .patch(
    '/me/avatar',
    ({ body, userId }) => {
      return ChatsService.updateAvatar(
        userId,
        body.background_color,
        body.emoji,
      );
    },
    {
      body: UpdateAvatarSchema,
    },
  )
  .get('/contacts', ({ userId, institutionId }) => {
    return ChatsService.getContacts(userId, institutionId);
  })
  .get('/classes', ({ institutionId }) => {
    return ChatsService.getClasses(institutionId);
  })
  .get('/chats', ({ userId }) => {
    return ChatsService.getChats(userId);
  })
  .post(
    '/chats',
    ({ body, userId, institutionId }) => {
      return ChatsService.createChat(userId, institutionId, body.peer_user_id);
    },
    { body: CreateChatSchema },
  )
  .get(
    '/chats/:id',
    ({ params, userId }) => {
      return ChatsService.getChatById(userId, params.id);
    },
    { params: ChatIdParamsSchema },
  )
  .get(
    '/chats/:id/messages',
    ({ params, query, userId }) => {
      return ChatsService.getChatMessages(
        userId,
        params.id,
        query.limit ?? 50,
        query.before_cursor,
      );
    },
    {
      params: ChatIdParamsSchema,
      query: GetChatMessagesQuerySchema,
    },
  )
  .delete(
    '/chats/:id',
    ({ params, userId }) => {
      return ChatsService.deleteChat(userId, params.id);
    },
    { params: ChatIdParamsSchema },
  );
