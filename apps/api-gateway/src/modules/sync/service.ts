import { asc, eq, sql } from 'drizzle-orm';
import { auditLog, db, userCursorState, userEventStream } from '@repo/database';
import {
  computeNextSyncWindow,
  createSyncResponseDto,
  PROTOCOL_VERSION,
  type UserEventEnvelope,
} from '@repo/sync-protocol';

export class SyncService {
  private static toEnvelope(
    row: typeof userEventStream.$inferSelect,
  ): UserEventEnvelope {
    return {
      version: PROTOCOL_VERSION,
      event_id: row.eventId,
      user_id: row.userId,
      cursor: row.cursor.toString(),
      event_type: row.eventType,
      entity_id: row.entityId,
      created_at: row.createdAt.toISOString(),
      payload_metadata: row.payloadMetadata,
    };
  }

  static async sync(
    userId: string,
    afterCursor: string | undefined,
    limit: number | undefined,
  ) {
    const window = computeNextSyncWindow(afterCursor ?? '0', limit);

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
    const lastPage = page[page.length - 1];
    const nextCursor = lastPage
      ? lastPage.cursor.toString()
      : window.after_cursor;

    return createSyncResponseDto({
      events: page.map(SyncService.toEnvelope),
      next_cursor: nextCursor,
      has_more: hasMore,
    });
  }

  static async ack(
    userId: string,
    institutionId: string | null,
    lastAckCursor: string,
  ) {
    const incoming = BigInt(lastAckCursor);

    const result = await db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(userCursorState)
        .where(eq(userCursorState.userId, userId));
      const currentAck = current?.lastAckCursor ?? 0n;

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
      version: PROTOCOL_VERSION,
      accepted: result.accepted,
      acknowledged_cursor: result.acknowledged_cursor.toString(),
    };
  }
}
