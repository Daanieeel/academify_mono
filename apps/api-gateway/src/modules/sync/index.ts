import { Elysia, t } from 'elysia';
import { authMiddleware } from '../../plugins/auth';
import { AppError } from '../../plugins/error';
import { SyncService } from './service';
import { parseAckRequestDto, parseSyncRequestDto } from '@repo/sync-protocol';

export const syncRoutes = new Elysia()
  .use(authMiddleware)
  .post(
    '/sync',
    ({ body, userId }) => {
      let request;
      try {
        request = parseSyncRequestDto(body);
      } catch {
        throw new AppError(
          400,
          'INVALID_SYNC_REQUEST',
          'invalid /sync request',
        );
      }
      return SyncService.sync(userId, request.after_cursor, request.limit);
    },
    {
      body: t.Object({
        version: t.String(),
        after_cursor: t.String(),
        limit: t.Optional(t.Number()),
      }),
    },
  )
  .post(
    '/ack',
    ({ body, userId, institutionId }) => {
      let request;
      try {
        request = parseAckRequestDto(body);
      } catch {
        throw new AppError(400, 'INVALID_ACK_REQUEST', 'invalid /ack request');
      }
      return SyncService.ack(userId, institutionId, request.last_ack_cursor);
    },
    {
      body: t.Object({
        version: t.String(),
        last_ack_cursor: t.String(),
      }),
    },
  );
