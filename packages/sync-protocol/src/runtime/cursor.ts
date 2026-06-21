import type { Cursor } from '../schemas';

const DEFAULT_SYNC_LIMIT = 100;
const MAX_SYNC_LIMIT = 500;

// Cursors are decimal strings (see core/cursor.ts) so comparisons go through
// BigInt — values can exceed Number.MAX_SAFE_INTEGER over the life of a tenant.
const toBigInt = (cursor: Cursor): bigint => BigInt(cursor);

// Invariant: a cursor is only valid to apply if it is strictly greater than
// the last cursor applied for that user. Equal or lower means duplicate/replay.
export function validateCursorProgression(
  currentCursor: Cursor,
  nextCursor: Cursor,
): boolean {
  return toBigInt(nextCursor) > toBigInt(currentCursor);
}

// Duplicate delivery and out-of-order delivery share one rule: if the incoming
// cursor is not strictly greater than what's already been applied, drop it.
export function isDuplicateOrOutOfOrder(
  lastAppliedCursor: Cursor,
  incomingCursor: Cursor,
): boolean {
  return toBigInt(incomingCursor) <= toBigInt(lastAppliedCursor);
}

// Ack advancement is monotonic-only: an ack at or below the stored cursor is
// stale (replay, out-of-order network delivery) and must be rejected, not applied.
export function isStaleAck(
  currentAckCursor: Cursor,
  incomingAckCursor: Cursor,
): boolean {
  return toBigInt(incomingAckCursor) <= toBigInt(currentAckCursor);
}

export interface SyncWindow {
  after_cursor: Cursor;
  limit: number;
}

// Gaps between after_cursor and the next available cursor are expected and
// fine — the window is just clamped paging input, not a contiguity check.
export function computeNextSyncWindow(
  afterCursor: Cursor,
  limit: number = DEFAULT_SYNC_LIMIT,
): SyncWindow {
  const clampedLimit = Math.min(Math.max(Math.trunc(limit), 1), MAX_SYNC_LIMIT);

  return {
    after_cursor: afterCursor,
    limit: clampedLimit,
  };
}
