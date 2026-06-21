import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Control-plane record (global, always ours) — deliberately not shared code
// with `packages/database`'s per-tenant `institutions` table. A backend's
// own `institutions` row is the *local* tenant record; this registry is the
// *global* routing record that points a school at whichever backend serves
// it. Keeping these as two separate schemas/migration histories (not just
// two tables in one shared package) is what makes self-hosting a deployment
// change later, rather than a rewrite (see ADR-0009).
export const deploymentModeEnum = pgEnum('registry_deployment_mode', [
  'hosted',
  'self_hosted',
]);

export const registryStatusEnum = pgEnum('registry_status', [
  'active',
  'suspended',
]);

export const institutionRegistry = pgTable('institution_registry', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  displayName: text('display_name').notNull(),
  region: text('region'),
  deploymentMode: deploymentModeEnum('deployment_mode')
    .notNull()
    .default('hosted'),
  // For the MVP every row resolves to the single local backend; a real
  // self-hosted row would point here instead — the resolve contract is
  // already shaped for that, even though nothing produces it yet.
  backendUrl: text('backend_url').notNull(),
  status: registryStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
