import { asc, desc, eq } from 'drizzle-orm';
import type { ElysiaWS } from 'elysia/ws';
import Redis from 'ioredis';
import { channelNames, getRedisConnectionOptions } from '@repo/redis';
import { db, userEventStream } from '@repo/database';
import {
  createLiveEventNotify,
  createServerSyncRequired,
  type UserEventEnvelope,
} from '@repo/sync-protocol';

export type Socket = ElysiaWS<{ userId: string }>;

export class WsService {
  private static connectionsByUser = new Map<string, Set<Socket>>();
  private static lastPushedCursorByUser = new Map<string, bigint>();
  private static subscriber: Redis | null = null;

  static init() {
    if (WsService.subscriber) {return;}

    WsService.subscriber = new Redis(getRedisConnectionOptions());
    void WsService.subscriber.subscribe(channelNames.syncBroadcast);
    WsService.subscriber.on('message', (_channel: string, raw: string) => {
      void WsService.handleWake(raw);
    });
  }

  private static toEnvelope(
    row: typeof userEventStream.$inferSelect,
  ): UserEventEnvelope {
    return {
      version: '1.0.0',
      event_id: row.eventId,
      user_id: row.userId,
      cursor: row.cursor.toString(),
      event_type: row.eventType as UserEventEnvelope['event_type'],
      entity_id: row.entityId,
      created_at: row.createdAt.toISOString(),
      payload_metadata:
        row.payloadMetadata as UserEventEnvelope['payload_metadata'],
    };
  }

  private static async latestCursorFor(userId: string): Promise<bigint> {
    const [latest] = await db
      .select({ cursor: userEventStream.cursor })
      .from(userEventStream)
      .where(eq(userEventStream.userId, userId))
      .orderBy(desc(userEventStream.cursor))
      .limit(1);

    return latest?.cursor ?? 0n;
  }

  private static async handleWake(raw: string): Promise<void> {
    let userId: string;
    try {
      ({ userId } = JSON.parse(raw) as { userId: string });
    } catch {
      return;
    }

    const sockets = WsService.connectionsByUser.get(userId);
    if (!sockets || sockets.size === 0) {
      return;
    }

    const since = WsService.lastPushedCursorByUser.get(userId) ?? 0n;
    const rows = await db
      .select()
      .from(userEventStream)
      .where(eq(userEventStream.userId, userId))
      .orderBy(asc(userEventStream.cursor));

    const newRows = rows.filter((row) => row.cursor > since);
    if (newRows.length === 0) {
      return;
    }

    for (const row of newRows) {
      const notify = createLiveEventNotify({
        event: WsService.toEnvelope(row),
      });
      for (const socket of sockets) {
        socket.send(JSON.stringify(notify));
      }
    }

    WsService.lastPushedCursorByUser.set(
      userId,
      newRows[newRows.length - 1]!.cursor,
    );
  }

  static addConnection(userId: string, ws: Socket) {
    let sockets = WsService.connectionsByUser.get(userId);
    if (!sockets) {
      sockets = new Set();
      WsService.connectionsByUser.set(userId, sockets);
    }
    sockets.add(ws);
  }

  static removeConnection(userId: string, ws: Socket) {
    const sockets = WsService.connectionsByUser.get(userId);
    sockets?.delete(ws);
    if (sockets && sockets.size === 0) {
      WsService.connectionsByUser.delete(userId);
      WsService.lastPushedCursorByUser.delete(userId);
    }
  }

  static async handleHello(userId: string, ws: Socket, lastAckCursor: string) {
    const latest = await WsService.latestCursorFor(userId);
    const provided = BigInt(lastAckCursor);

    if (provided < latest) {
      ws.send(
        JSON.stringify(
          createServerSyncRequired({
            required_after_cursor: provided.toString(),
          }),
        ),
      );
    }

    WsService.lastPushedCursorByUser.set(userId, latest);
  }
}

// Initialize subscriber on module load
WsService.init();
