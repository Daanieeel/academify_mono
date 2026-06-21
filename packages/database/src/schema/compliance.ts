import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { user } from './auth';
import { chats } from './chats';
import { bytea } from './columns';
import { institutions } from './identity';
import { messages } from './messaging';

export const reportStatusEnum = pgEnum('report_status', [
  'pending',
  'reviewing',
  'resolved',
  'dismissed',
]);

export const auditingSessionStatusEnum = pgEnum('auditing_session_status', [
  'pending',
  'approved',
  'expired',
  'revoked',
]);

// Public key only — the matching private key lives in a secrets store/KMS,
// never in this database (see ADR-0006).
export const complianceKeys = pgTable(
  'compliance_keys',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    institutionId: uuid('institution_id')
      .notNull()
      .references(() => institutions.id),
    keyVersion: integer('key_version').notNull(),
    publicKey: bytea('public_key').notNull(),
    active: boolean('active').notNull().default(true),
  },
  (table) => [
    uniqueIndex('compliance_keys_institution_version_idx').on(
      table.institutionId,
      table.keyVersion,
    ),
  ],
);

export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  reporterUserId: text('reporter_user_id')
    .notNull()
    .references(() => user.id),
  reportedMessageId: uuid('reported_message_id')
    .notNull()
    .references(() => messages.id),
  chatId: uuid('chat_id')
    .notNull()
    .references(() => chats.id),
  status: reportStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolvedBy: text('resolved_by').references(() => user.id),
  resolvedAt: timestamp('resolved_at'),
});

// The report-escrow payload: reporter's client seals the reported message +
// context to `compliance_keys.public_key` client-side. This row only ever
// holds ciphertext (see ADR-0006) — the server cannot read report content.
export const reportPackages = pgTable('report_packages', {
  id: uuid('id').defaultRandom().primaryKey(),
  reportId: uuid('report_id')
    .notNull()
    .unique()
    .references(() => reports.id, { onDelete: 'cascade' }),
  encryptedPackage: bytea('encrypted_package').notNull(),
  complianceKeyVersion: integer('compliance_key_version').notNull(),
  contentHash: text('content_hash').notNull(),
});

// Dual-authorization tracker for the report-escrow review (ADR-0006): a
// report can only be decrypted once two *distinct* approvers — an admin and
// the reporter's Klassenlehrer — have each approved within the review window
// (enforced in the route, not here). The unique index stops one person's
// approval from counting twice toward that threshold.
export const reportApprovals = pgTable(
  'report_approvals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    reportId: uuid('report_id')
      .notNull()
      .references(() => reports.id, { onDelete: 'cascade' }),
    approverUserId: text('approver_user_id')
      .notNull()
      .references(() => user.id),
    approverRole: text('approver_role').notNull(),
    approvedAt: timestamp('approved_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('report_approvals_report_approver_idx').on(
      table.reportId,
      table.approverUserId,
    ),
  ],
);

// Hash-chained for tamper-evidence: each row's `prevHash` links to the prior
// row for the same institution, so the chain breaks visibly if a row is altered.
export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  actorUserId: text('actor_user_id')
    .notNull()
    .references(() => user.id),
  action: text('action').notNull(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  prevHash: text('prev_hash'),
});

// Stub for the future institution-wide `institutional_auditing_mode`
// (ADR-0004) — deferred past the MVP; report-escrow (ADR-0006) covers
// per-report compliance access for now.
export const auditingSessions = pgTable('auditing_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  institutionId: uuid('institution_id')
    .notNull()
    .references(() => institutions.id),
  requestedBy: text('requested_by')
    .notNull()
    .references(() => user.id),
  approverIds: jsonb('approver_ids').notNull(),
  scope: text('scope').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  status: auditingSessionStatusEnum('status').notNull().default('pending'),
});
