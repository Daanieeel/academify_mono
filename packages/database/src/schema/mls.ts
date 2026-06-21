import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { user } from './auth';
import { chats } from './chats';
import { bytea } from './columns';

export const devices = pgTable('devices', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  label: text('label'),
  identityPubkey: bytea('identity_pubkey').notNull(),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// MLS key packages are one-time-use: `consumedAt` is set the moment a
// recipient's package is used to add them to a group, and it cannot be reused.
export const keyPackages = pgTable('key_packages', {
  id: uuid('id').defaultRandom().primaryKey(),
  deviceId: uuid('device_id')
    .notNull()
    .references(() => devices.id, { onDelete: 'cascade' }),
  keyPackageBytes: bytea('key_package_bytes').notNull(),
  consumedAt: timestamp('consumed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const mlsGroups = pgTable('mls_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  chatId: uuid('chat_id')
    .notNull()
    .unique()
    .references(() => chats.id, { onDelete: 'cascade' }),
  mlsGroupId: bytea('mls_group_id').notNull(),
  currentEpoch: integer('current_epoch').notNull().default(0),
  cipherSuite: text('cipher_suite').notNull(),
});

export const mlsGroupMembers = pgTable(
  'mls_group_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    groupId: uuid('group_id')
      .notNull()
      .references(() => mlsGroups.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    deviceId: uuid('device_id')
      .notNull()
      .references(() => devices.id),
    leafIndex: integer('leaf_index').notNull(),
    addedEpoch: integer('added_epoch').notNull(),
    removedEpoch: integer('removed_epoch'),
    // Set when this member was added by someone else's commit; holds the
    // serialized Welcome until the new member fetches it once (Delivery
    // Service relay — the gateway never decrypts it, just stores ciphertext).
    pendingWelcome: bytea('pending_welcome'),
  },
  (table) => [
    uniqueIndex('mls_group_members_group_leaf_idx').on(
      table.groupId,
      table.leafIndex,
    ),
  ],
);
