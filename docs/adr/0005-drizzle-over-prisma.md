# ADR-0005: Drizzle as the ORM Layer

- Status: Accepted
- Date: 2026-06-20
- Deciders: Platform team
- Technical area: database
- Supersedes: ADR-0003

## Context

ADR-0003 adopted Prisma as the only ORM. The `packages/database` schema was never populated under Prisma (no models, no migrations), so no live data or migration history exists to preserve. The messaging MVP needs a schema design with heavy use of `bigint` cursors, `bytea` ciphertext columns, composite/partial indexes for recipient resolution and inbox reads, and row-level locking (`SELECT ... FOR UPDATE`) for monotonic cursor allocation. Drizzle's SQL-first query builder maps these patterns more directly than Prisma's generated client, and its lighter runtime suits the Bun-first stack.

## Decision

Use Drizzle ORM (`drizzle-orm` + `postgres` driver) as the only ORM in this monorepo. Schema lives in `packages/database/src/schema/*.ts`, migrations are managed with `drizzle-kit`. All data access routes through `@repo/database`'s exported `db` client and schema tables, per the data-access boundary established in ADR-0003.

## Consequences

- Positive: SQL-shaped query builder for cursor/index-heavy access patterns; lighter runtime; native TypeScript schema-as-code; better-auth's official Drizzle adapter is used directly for auth tables.
- Negative: lose Prisma Studio and Prisma's migration-diffing UX; team gains a second migration tool's mental model.
- Neutral: zero data migration cost — the Prisma schema was never populated.

## Rollout

1. Removed `@prisma/client` + `prisma` from `packages/database`; added `drizzle-orm`, `drizzle-kit`, `postgres`.
2. Deleted `prisma/` and `prisma.config.ts`; added `drizzle.config.ts`.
3. `packages/database/index.ts` exports a real `drizzle(postgres(...))` client plus all schema tables/types.
4. `docs/local-development.md` migration commands updated to `drizzle-kit generate` / `drizzle-kit migrate`.

## References

- ADR-0003 (superseded)
- `packages/database/drizzle.config.ts`
