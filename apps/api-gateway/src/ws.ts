import { asc, desc, eq } from 'drizzle-orm';
import { Elysia } from 'elysia';
import type { ElysiaWS } from 'elysia/ws';
import Redis from 'ioredis';
import { channelNames, getRedisConnectionOptions } from '@repo/redis';
import { db, userEventStream } from '@repo/database';
import {
  createLiveEventNotify,
  createServerSyncRequired,
  parseWsMessage,
  type UserEventEnvelope,
} from '@repo/sync-protocol';

import { authMiddleware } from './auth-middleware';

type Socket = ElysiaWS<{ userId: string }>;

const connectionsByUser = new Map<string, Set<Socket>>();
const lastPushedCursorByUser = new Map<string, bigint>();

function toEnvelope(
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

async function latestCursorFor(userId: string): Promise<bigint> {
  const [latest] = await db
    .select({ cursor: userEventStream.cursor })
    .from(userEventStream)
    .where(eq(userEventStream.userId, userId))
    .orderBy(desc(userEventStream.cursor))
    .limit(1);

  return latest?.cursor ?? 0n;
}

// Single shared subscriber for the whole gateway process — not one per
// connection. Each wake just names a userId; this fetches what's new since
// the last push and forwards it as `event.notify` (ADR-0001: notify over WS).
const subscriber = new Redis(getRedisConnectionOptions());
void subscriber.subscribe(channelNames.syncBroadcast);
subscriber.on('message', (_channel: string, raw: string) => {
  void handleWake(raw);
});

async function handleWake(raw: string): Promise<void> {
  let userId: string;
  try {
    ({ userId } = JSON.parse(raw) as { userId: string });
  } catch {
    return;
  }

  const sockets = connectionsByUser.get(userId);
  if (!sockets || sockets.size === 0) {
    return;
  }

  const since = lastPushedCursorByUser.get(userId) ?? 0n;
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
    const notify = createLiveEventNotify({ event: toEnvelope(row) });
    for (const socket of sockets) {
      socket.send(JSON.stringify(notify));
    }
  }

  lastPushedCursorByUser.set(userId, newRows[newRows.length - 1]!.cursor);
}

export const wsRoutes = new Elysia().use(authMiddleware).ws('/ws', {
  open(ws) {
    const userId = (ws.data as { userId: string }).userId;
    let sockets = connectionsByUser.get(userId);
    if (!sockets) {
      sockets = new Set();
      connectionsByUser.set(userId, sockets);
    }
    sockets.add(ws as unknown as Socket);
  },
  async message(ws, raw) {
    const userId = (ws.data as { userId: string }).userId;
    const parsed = parseWsMessage(
      typeof raw === 'string' ? JSON.parse(raw) : raw,
    );

    if (parsed.type !== 'client.hello') {
      return;
    }

    const latest = await latestCursorFor(userId);
    const provided = BigInt(parsed.last_ack_cursor);

    if (provided < latest) {
      ws.send(
        JSON.stringify(
          createServerSyncRequired({
            required_after_cursor: provided.toString(),
          }),
        ),
      );
    }

    // Live pushes only cover what happens *after* this point; catching up on
    // the gap above is the client's job via /sync, not a WS responsibility.
    lastPushedCursorByUser.set(userId, latest);
  },
  close(ws) {
    const userId = (ws.data as { userId: string }).userId;
    const sockets = connectionsByUser.get(userId);
    sockets?.delete(ws as unknown as Socket);
    if (sockets && sockets.size === 0) {
      connectionsByUser.delete(userId);
      lastPushedCursorByUser.delete(userId);
    }
  },
});
