# ADR-0003: Prisma as the Only ORM Layer

- Status: Accepted
- Date: 2026-04-19
- Deciders: Platform team
- Technical area: database
- Supersedes: n/a

## Context

Multiple ORMs or ad-hoc DB access patterns increase migration risk, schema drift, and onboarding complexity. The repository already centers schema and migrations in the shared database package.

## Decision

Use Prisma as the only ORM in this monorepo. New data access must route through the shared database package and Prisma client.

## Consequences

- Positive: Unified schema management, predictable migrations, shared typing model.
- Negative: Prisma feature constraints must be handled with raw SQL extensions where needed.
- Neutral: Team conventions must document when raw queries are acceptable.

## Options considered

1. Mixed ORM usage by app/team.
2. Prisma-only policy.
3. Query-builder without ORM.

## Rollout

1. Ban introducing additional ORMs in package manifests.
2. Keep migrations in `packages/database/prisma`.
3. Add review check for direct DB driver usage outside approved layers.
4. Document exceptions for audited raw SQL paths.

## References

- [packages/database](../../packages/database)
- Ticket 0.2
