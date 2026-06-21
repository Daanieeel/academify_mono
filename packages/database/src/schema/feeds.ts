import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { user } from './auth';
import { institutions } from './identity';

// Future-prep schema for upcoming README features (blackboard/news, events,
// clubs/join-requests). Created now so the worker fan-out shape (Phase 5) and
// the sync event types (`blackboard.*`, `event.*`, `club.*`, `join_request.*`)
// already in @repo/sync-protocol have tables to point at; not wired into the
// gateway/worker in the MVP.

export const audienceScopeEnum = pgEnum('audience_scope', [
  'institution',
  'class',
  'club',
]);

export const eventLifecycleStatusEnum = pgEnum('event_lifecycle_status', [
  'scheduled',
  'updated',
  'cancelled',
]);

export const joinRequestStatusEnum = pgEnum('join_request_status', [
  'pending',
  'approved',
  'rejected',
  'cancelled',
]);

export const blackboardPosts = pgTable('blackboard_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  authorUserId: text('author_user_id')
    .notNull()
    .references(() => user.id),
  audienceScope: audienceScopeEnum('audience_scope').notNull(),
  audienceScopeId: uuid('audience_scope_id'),
  title: text('title').notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  audienceScope: audienceScopeEnum('audience_scope').notNull(),
  audienceScopeId: uuid('audience_scope_id'),
  title: text('title').notNull(),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at'),
  status: eventLifecycleStatusEnum('status').notNull().default('scheduled'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const clubs = pgTable('clubs', {
  id: uuid('id').defaultRandom().primaryKey(),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const clubMemberships = pgTable(
  'club_memberships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clubId: uuid('club_id')
      .notNull()
      .references(() => clubs.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [
    uniqueIndex('club_memberships_club_user_idx').on(
      table.clubId,
      table.userId,
    ),
  ],
);

export const joinRequests = pgTable('join_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  clubId: uuid('club_id')
    .notNull()
    .references(() => clubs.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  status: joinRequestStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
