import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { user } from './auth';

export const deploymentModeEnum = pgEnum('deployment_mode', [
  'hosted',
  'self_hosted',
]);

export const roleEnum = pgEnum('role', [
  'student',
  'teacher',
  'admin',
  'compliance_officer',
  'headmaster',
]);

export const provisioningSourceEnum = pgEnum('provisioning_source', [
  'csv',
  'invite',
]);

// Local tenant record (data plane). The global routing record lives in the
// control-plane `institution_registry` (apps/directory), kept deliberately
// separate so self-hosting is a deployment change, not a schema change.
export const institutions = pgTable('institutions', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  displayName: text('display_name').notNull(),
  region: text('region'),
  deploymentMode: deploymentModeEnum('deployment_mode')
    .notNull()
    .default('hosted'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Encrypted PII lives here, separated from the auth identity (`user`) per the
// data-protection rule: auth/session fields stay plaintext, profile PII doesn't.
export const profiles = pgTable('profiles', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  displayNameCiphertext: text('display_name_ciphertext').notNull(),
  keyVersion: integer('key_version').notNull(),
  photoRef: text('photo_ref'),
  // Generated avatar (background color + emoji) shown until real photo
  // upload exists. Resolution order everywhere: photoRef > these > icon
  // fallback.
  avatarBackgroundColor: text('avatar_background_color'),
  avatarEmoji: text('avatar_emoji'),
});

export const roleBindings = pgTable(
  'role_bindings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    role: roleEnum('role').notNull(),
    // Optional scope id (e.g. a class/club id) for scoped bindings; not an FK
    // since the scoped entity type varies by role.
    scope: text('scope'),
  },
  (table) => [
    uniqueIndex('role_bindings_user_role_scope_idx').on(
      table.userId,
      table.role,
      table.scope,
    ),
  ],
);

// Account-provisioning schema for future CSV-import + invite-link flows
// (endpoints stubbed in Phase 6, admin UI deferred).
export const invites = pgTable('invites', {
  id: uuid('id').defaultRandom().primaryKey(),
  token: text('token').notNull().unique(),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  // Not an FK to `classes` to avoid a schema-file import cycle (org.ts already
  // references institutions); enforced at the application layer for now.
  classId: uuid('class_id'),
  role: roleEnum('role').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  consumedAt: timestamp('consumed_at'),
  createdBy: text('created_by')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const provisioningBatches = pgTable('provisioning_batches', {
  id: uuid('id').defaultRandom().primaryKey(),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  source: provisioningSourceEnum('source').notNull(),
  status: text('status').notNull().default('pending'),
  createdBy: text('created_by')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
