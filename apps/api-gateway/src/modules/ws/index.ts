import { Elysia } from 'elysia';
import { parseWsMessage } from '@repo/sync-protocol';
import { authMiddleware } from '../../plugins/auth';
import { WsService, type Socket } from './service';

export const wsRoutes = new Elysia().use(authMiddleware).ws('/ws', {
  open(ws) {
    const userId = (ws.data as { userId: string }).userId;
    WsService.addConnection(userId, ws as unknown as Socket);
  },
  async message(ws, raw) {
    const userId = (ws.data as { userId: string }).userId;
    const parsed = parseWsMessage(
      typeof raw === 'string' ? JSON.parse(raw) : raw,
    );

    if (parsed.type !== 'client.hello') {
      return;
    }

    await WsService.handleHello(
      userId,
      ws as unknown as Socket,
      parsed.last_ack_cursor,
    );
  },
  close(ws) {
    const userId = (ws.data as { userId: string }).userId;
    WsService.removeConnection(userId, ws as unknown as Socket);
  },
});
