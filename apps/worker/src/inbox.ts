import { sql } from 'drizzle-orm';
import Redis from 'ioredis';
import { channelNames, getRedisConnectionOptions } from '@repo/redis';
import { db, userCursorState, userEventStream } from '@repo/database';
import type { EventType, PayloadMetadata } from '@repo/sync-protocol';

const publisher = new Redis(getRedisConnectionOptions());

export interface AppendUserEventInput {
  userId: string;
  eventType: EventType;
  entityId: string;
  payloadMetadata: PayloadMetadata;
  payloadRef?: string;
}

// Atomically allocates the next per-user cursor and appends the inbox row in
// one transaction, so a crash between the two can never leave a cursor
// advanced with no corresponding event (an unrecoverable gap, vs. the
// expected/tolerated gaps in cursor *values* the sync contract already allows).
async function appendUserEvent(input: AppendUserEventInput): Promise<void> {
  await db.transaction(async (tx) => {
    // First-ever cursor for a user must be 1, not 0: "0" is the client's
    // "nothing acked yet, give me everything" sentinel (after_cursor=0), and
    // a strictly-greater-than comparison would never surface a cursor of 0.
    const [allocated] = await tx
      .insert(userCursorState)
      .values({ userId: input.userId, nextCursor: 2n, lastAckCursor: 0n })
      .onConflictDoUpdate({
        target: userCursorState.userId,
        set: {
          nextCursor: sql`${userCursorState.nextCursor} + 1`,
          updatedAt: new Date(),
        },
      })
      .returning({
        assignedCursor: sql<bigint>`${userCursorState.nextCursor} - 1`,
      });

    if (!allocated) {
      throw new Error(`failed to allocate cursor for user ${input.userId}`);
    }

    await tx.insert(userEventStream).values({
      userId: input.userId,
      cursor: allocated.assignedCursor,
      eventType: input.eventType,
      entityId: input.entityId,
      payloadMetadata: input.payloadMetadata,
      payloadRef: input.payloadRef,
    });
  });
}

// Per-user wake signal on the shared broadcast channel; gateways subscribe
// once and filter by userId (see ADR-0001 — notify over WS, fetch over REST).
async function publishWake(userId: string): Promise<void> {
  await publisher.publish(
    channelNames.syncBroadcast,
    JSON.stringify({ userId }),
  );
}

// Combines the two steps Ticket 1.6 requires per recipient: durable write,
// then publish — in that order, never the reverse.
export async function deliverToUser(
  input: AppendUserEventInput,
): Promise<void> {
  await appendUserEvent(input);
  await publishWake(input.userId);
}
