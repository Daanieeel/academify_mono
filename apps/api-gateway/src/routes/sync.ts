import { asc, eq, sql } from 'drizzle-orm';
import { Elysia } from 'elysia';
import { auditLog, db, userCursorState, userEventStream } from '@repo/database';
import {
  computeNextSyncWindow,
  createSyncResponseDto,
  parseAckRequestDto,
  parseSyncRequestDto,
  type UserEventEnvelope,
} from '@repo/sync-protocol';

import { authMiddleware } from '../auth-middleware';

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

export const syncRoutes = new Elysia()
  .use(authMiddleware)
  .post('/sync', async ({ body, userId, status }) => {
    let request;
    try {
      request = parseSyncRequestDto(body);
    } catch {
      return status(400, { error: 'invalid /sync request' });
    }

    const window = computeNextSyncWindow(
      request.after_cursor ?? '0',
      request.limit,
    );

    // Index-backed via the (user_id, cursor) unique index (Phase 1 schema);
    // fetch one extra row to compute has_more without a second count query.
    const rows = await db
      .select()
      .from(userEventStream)
      .where(
        sql`${userEventStream.userId} = ${userId} AND ${userEventStream.cursor} > ${BigInt(window.after_cursor)}`,
      )
      .orderBy(asc(userEventStream.cursor))
      .limit(window.limit + 1);

    const hasMore = rows.length > window.limit;
    const page = hasMore ? rows.slice(0, window.limit) : rows;
    const nextCursor =
      page.length > 0
        ? page[page.length - 1]!.cursor.toString()
        : window.after_cursor;

    return createSyncResponseDto({
      events: page.map(toEnvelope),
      next_cursor: nextCursor,
      has_more: hasMore,
    });
  })
  .post('/ack', async ({ body, userId, institutionId, status }) => {
    let request;
    try {
      request = parseAckRequestDto(body);
    } catch {
      return status(400, { error: 'invalid /ack request' });
    }

    const incoming = BigInt(request.last_ack_cursor);

    const result = await db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(userCursorState)
        .where(eq(userCursorState.userId, userId));
      const currentAck = current?.lastAckCursor ?? 0n;

      // Monotonic-only: reject anything that would move the ack backward.
      // Repeating the same value is treated as idempotent success, not stale.
      if (incoming < currentAck) {
        return { accepted: false, acknowledged_cursor: currentAck };
      }

      if (incoming > currentAck) {
        await tx
          .insert(userCursorState)
          .values({
            userId,
            nextCursor: incoming + 1n,
            lastAckCursor: incoming,
          })
          .onConflictDoUpdate({
            target: userCursorState.userId,
            set: { lastAckCursor: incoming, updatedAt: new Date() },
          });

        if (institutionId) {
          await tx.insert(auditLog).values({
            institutionId,
            actorUserId: userId,
            action: 'ack.advanced',
            targetType: 'user_cursor_state',
            targetId: userId,
            metadata: { from: currentAck.toString(), to: incoming.toString() },
          });
        }
      }

      return { accepted: true, acknowledged_cursor: incoming };
    });

    return {
      version: '1.0.0' as const,
      accepted: result.accepted,
      acknowledged_cursor: result.acknowledged_cursor.toString(),
    };
  });
