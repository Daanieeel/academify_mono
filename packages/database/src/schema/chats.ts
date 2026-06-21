import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { user } from './auth';
import { clubs } from './feeds';
import { institutions } from './identity';
import { classes } from './org';

export const chatTypeEnum = pgEnum('chat_type', [
  'dm',
  'class',
  'club',
  'adhoc',
]);

export const chatMemberStateEnum = pgEnum('chat_member_state', [
  'active',
  'removed',
]);

export const chats = pgTable('chats', {
  id: uuid('id').defaultRandom().primaryKey(),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  type: chatTypeEnum('type').notNull(),
  // Encrypted at rest like message content; null for 1:1 chats without a title.
  titleCiphertext: text('title_ciphertext'),
  linkedClassId: uuid('linked_class_id').references(() => classes.id),
  linkedClubId: uuid('linked_club_id').references(() => clubs.id),
  createdBy: text('created_by')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Worker-owned recipient resolution (ADR-0002) reads this table; the
// (chat_id, state) index keeps "resolve active members of a chat" index-backed.
export const chatMembers = pgTable(
  'chat_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    chatId: uuid('chat_id')
      .notNull()
      .references(() => chats.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    state: chatMemberStateEnum('state').notNull().default('active'),
    role: text('role').notNull().default('member'),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
    removedAt: timestamp('removed_at'),
  },
  (table) => [
    uniqueIndex('chat_members_chat_user_idx').on(table.chatId, table.userId),
    index('chat_members_chat_state_idx').on(table.chatId, table.state),
  ],
);
