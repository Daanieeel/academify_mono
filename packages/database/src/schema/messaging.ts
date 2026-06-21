import { sql } from 'drizzle-orm';
import {
  bigint,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { user } from './auth';
import { chats } from './chats';
import { bytea } from './columns';
import { devices } from './mls';

// `deletedAt` is a tombstone, not a hard delete: deletion is itself a
// syncable event so other devices/clients converge on "this message is gone".
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  chatId: uuid('chat_id')
    .notNull()
    .references(() => chats.id, { onDelete: 'cascade' }),
  senderUserId: text('sender_user_id')
    .notNull()
    .references(() => user.id),
  senderDeviceId: uuid('sender_device_id')
    .notNull()
    .references(() => devices.id),
  mlsEpoch: integer('mls_epoch').notNull(),
  ciphertext: bytea('ciphertext').notNull(),
  contentType: text('content_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  editedAt: timestamp('edited_at'),
  deletedAt: timestamp('deleted_at'),
});

// The inbox: one row per (recipient, event). `cursor` is allocated per-user,
// strictly monotonic (see runtime/cursor.ts in @repo/sync-protocol and the
// allocation rule in ADR-0002) — never reused, never reordered after insert.
export const userEventStream = pgTable(
  'user_event_stream',
  {
    eventId: uuid('event_id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    cursor: bigint('cursor', { mode: 'bigint' }).notNull(),
    eventType: text('event_type').notNull(),
    entityId: text('entity_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    payloadMetadata: jsonb('payload_metadata').notNull(),
    payloadRef: text('payload_ref'),
  },
  (table) => [
    uniqueIndex('user_event_stream_user_cursor_idx').on(
      table.userId,
      table.cursor,
    ),
    index('user_event_stream_user_created_idx').on(
      table.userId,
      table.createdAt,
    ),
  ],
);

// Per-user cursor allocator + ack target. `nextCursor` is bumped under
// `SELECT ... FOR UPDATE` by the worker when appending to user_event_stream;
// `lastAckCursor` only ever advances (see isStaleAck in @repo/sync-protocol).
export const userCursorState = pgTable('user_cursor_state', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  nextCursor: bigint('next_cursor', { mode: 'bigint' })
    .notNull()
    .default(sql`0`),
  lastAckCursor: bigint('last_ack_cursor', { mode: 'bigint' })
    .notNull()
    .default(sql`0`),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
