# ADR-0009: Control-Plane / Data-Plane Tenancy via Institution Registry

- Status: Accepted
- Date: 2026-06-20
- Deciders: Platform team
- Technical area: infra
- Supersedes: n/a

## Context

Academify is public-facing and multi-school: a user picks their school before logging in. The product also commits to letting a school self-host its own backend + database later, rather than only ever running on shared infrastructure we operate. If "which backend does this school use" is encoded the same way as "what does this school's data look like" — i.e. baked into the same per-tenant `institutions` table every backend already has (Phase 1 schema) — then turning a hosted school into a self-hosted one means migrating code, not just data.

## Decision

Split tenancy into two deliberately separate things:

- **Data plane** — each backend's own `institutions` table (`packages/database`), the local tenant record every other table in that backend is scoped by `institution_id` to.
- **Control plane** — a new `apps/directory` service, with its **own** Drizzle schema/migration history (`institution_registry`), that the public website talks to *before* a user ever reaches a specific backend. It exposes two unauthenticated, no-PII endpoints: `GET /institutions?search=` (school picker) and `GET /institutions/:slug/resolve` (returns `backend_url` + `deployment_mode`).

`apps/directory` does not import `@repo/database` and has no code-level relationship to any backend's schema — the only contract between them is the resolved `backend_url`. For the MVP every registry row resolves to the single local `api-gateway`; a `self_hosted` row resolving to a different backend is a data change to the registry, not a code change anywhere.

## Consequences

- Positive: self-hosting becomes "add a registry row pointing elsewhere," not a rewrite. Control-plane code has zero coupling to per-tenant backend code.
- Negative: a second small service to deploy/operate; one more network hop in the public client's bootstrap flow (select school → resolve → connect).
- Neutral (local dev only): `apps/directory` currently points at the same local Postgres instance as the main backend for setup convenience, sharing the `drizzle`/`__drizzle_migrations` bookkeeping schema even though `institution_registry` and `institutions` are otherwise unrelated tables. A real deployment should put the control plane on its own database — nothing in the code assumes otherwise, this is purely a local-dev shortcut.

## Options considered

1. **Separate control-plane service + registry (chosen)**.
2. One shared `institutions` table with a `backend_url` column — rejected: conflates "this school's data" with "where to route this school," and a self-hosted backend would need read access to a database it doesn't own just to know about itself.

## Rollout

1. `apps/directory`: Elysia app, own `drizzle.config.ts`/migrations, `GET /institutions`, `GET /institutions/:slug/resolve`.
2. `packages/client-core`'s `SyncClient` already takes `backendUrl` as config — a real client flow is: directory search → resolve → construct `SyncClient({ backendUrl: resolved.backend_url, ... })`.
3. Deferred: anything that actually provisions a `self_hosted` row, per-tenant secrets/key custody for self-hosted deployments, and moving the control-plane DB off the shared local Postgres in non-dev environments.

## References

- `apps/directory/src/index.ts`
- `apps/directory/src/schema/institution-registry.ts`
