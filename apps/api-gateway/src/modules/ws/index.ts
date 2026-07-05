import { Elysia, t } from 'elysia';
import { parseWsMessage } from '@repo/sync-protocol';
import { authMiddleware } from '../../plugins/auth';
import { WsService } from './service';

const wsAuthRoutes = new Elysia()
  .use(authMiddleware)
  .post('/ws-token', async ({ userId }) => {
    const token = await WsService.generateToken(userId);
    return { token };
  });

const wsStreamRoutes = new Elysia()
  .derive(async ({ query }) => {
    if (typeof query.token !== 'string') {
      return { userId: null };
    }
    const userId = await WsService.validateTokenAndGetUserId(query.token);
    return { userId };
  })
  .ws('/ws', {
    query: t.Object({
      token: t.String(),
    }),
    open(ws) {
      const userId = ws.data.userId;
      if (!userId) {
        ws.close();
        return;
      }
      WsService.addConnection(userId, ws);
    },
    async message(ws, raw) {
      const userId = ws.data.userId;
      if (!userId) {
        return;
      }

      const parsed = parseWsMessage(
        typeof raw === 'string' ? JSON.parse(raw) : raw,
      );

      if (parsed.type !== 'client.hello') {
        return;
      }

      await WsService.handleHello(userId, ws, parsed.last_ack_cursor);
    },
    close(ws) {
      const userId = ws.data.userId;
      if (userId) {
        WsService.removeConnection(userId, ws);
      }
    },
  });

export const wsRoutes = new Elysia().use(wsAuthRoutes).use(wsStreamRoutes);
