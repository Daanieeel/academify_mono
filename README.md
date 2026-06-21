# academify_mono

## 1) Product scope (organized)

## Core product

A secure communication platform (web + mobile) for schools/universities:

- 1:1 teacher/professor ↔ student chats
- Class/club group chats with automatic membership sync
- Teacher-created ad-hoc groups
- Institution-wide blackboard/news feed
- Events module (for institution-wide events like concerts etc.)
- Clubs directory (join/request) with dedicated chats
- Users assigned to classes (with a head-teacher) and grades (levels) and subjects (based on their classes or a student council)

## Non-functional requirements

- **E2EE messaging via MLS**
- **Encrypted PII at rest** (names/details unreadable to DB operators)
- **Compliance-ready reporting/auditing**
- **Real-time + offline catch-up sync-engine**
- Horizontal scalability for WS + workers

## Stack

- Monorepo: **Turborepo**
- Web: **Next.js**
- Mobile: **Expo (React Native)**
- Realtime/API: **ElysiaJS** (REST + WebSocket)
- Queue/workers: **BullMQ**
- DB ORM: **Drizzle**
- Auth: **better-auth** (username + password, admin-provisioned accounts only)
- E2EE: **MLS** (OpenMLS via WASM)
- Redis: queue + pub/sub + ephemeral presence/sync signals

## Local development onboarding

See `docs/local-development.md` for complete setup instructions:

- prerequisites
- environment variables by app/package
- running migrations
- starting gateway/worker/web/mobile
- tests, linting, and troubleshooting

---

## 2) Target architecture (finalized)

## A) API + WS Gateway (ElysiaJS)

Responsibilities:

- Auth/session validation
- Accept send actions (REST/WS command), enqueue jobs
- Maintain active WS connections
- Push lightweight sync notifications (not full fan-out logic)
- Presence heartbeat handling

Rule:

- **No heavy fan-out in gateway**; keep latency low.

## B) Processor Layer (BullMQ workers)

Responsibilities:

- Process `SEND_MESSAGE`, `MEMBERSHIP_CHANGED`, `PROFILE_UPDATED`, `BLACKBOARD_POSTED`, etc.
- Resolve recipients (class, club, direct chat members)
- Write per-user inbox entries (inbox pattern)
- Publish wake/sync signal to Redis channel(s)

Rule:

- Worker is source of truth for distribution and sequencing.

## C) Sync Engine

Responsibilities:

- Per-user monotonic cursor/checkpoint
- On reconnect: deliver everything after last_ack_cursor
- While online: push new event notifications immediately
- Idempotent fetch/ack cycle to avoid duplicates

Rule:

- “Notify over WS, fetch from API” is correct and scalable.

## D) Compliance & Audit Layer

Two channels:

1. **User Report Flow**  
   Reporter submits report payload; system encrypts report package for institution compliance key.
2. **Institutional Auditing Mode (policy-based)**  
   Auditor identity in specific institution groups (or policy-approved key path), with strict gated access workflow.

Hard controls:

- Dual authorization (e.g., headmaster + compliance officer)
- Immutable audit log
- Time-bounded decryption sessions
- Scope-limited retrieval

---

## 3) Sync-engine contract (must-have)

You asked for: reconnect catch-up + live updates for all entity changes.  
Define one unified **User Event Stream** with event types:

- `message.created`
- `message.edited` (if allowed)
- `message.deleted` (tombstone event)
- `chat.updated` (group name/title changes)
- `membership.added|removed`
- `profile.updated` (display name/photo/role changes)
- `blackboard.created|updated`
- `event.created|updated|cancelled`
- `club.updated|join_request.updated`

Each event has:

- `event_id` (UUID)
- `user_id` (recipient)
- `cursor` (bigint sequence per user)
- `event_type`
- `entity_id`
- `created_at`
- `payload_encrypted` or minimal metadata reference

Client lifecycle:

1. Connect WS with auth + last_ack_cursor
2. Server responds with `sync.required` if gap exists
3. Client calls `/sync?after_cursor=...&limit=...`
4. Client applies events, decrypts needed payloads, acks new cursor
5. Live events continue through same contract

---

## 4) Data protection model (PII + search)

For encrypted user details:

- Field-level encryption for PII (name, email if required, phone, etc.)
- Store ciphertext + key version metadata
- Blind index for searchable fields (exact-match style; no plaintext lookup)
- Strict separation of:
  - auth identifiers
  - institutional profile data
  - encryption key references

Important:

- Don’t over-encrypt operational fields needed for joins/authorization (institution_id, role bindings, membership IDs).

---

## 5) Monorepo structure (cleaned)

```txt
apps/
  web/               # Next.js (chat + admin + blackboard + events)
  mobile/            # Expo app
  api-gateway/       # ElysiaJS REST + WS
  worker/            # BullMQ processors (fan-out, compliance, membership sync)
  directory/         # control-plane: public school directory + resolve API (ADR-0009)
  websocket/         # stub for a future dedicated WS-scale tier (not wired up)

packages/
  database/          # Drizzle schema, migrations, client (per-tenant data plane)
  mls/               # real OpenMLS compiled to WASM (crates/mls-wasm)
  crypto/            # AES-256-GCM + blind index + X25519 report-escrow seal/open
  redis/             # shared Redis clients, channels, queue config
  sync-protocol/     # shared event contracts, zod schemas, cursor logic
  auth/              # better-auth instance (username + password)
  env/               # @t3-oss/env-core wrapper + shared schema fragments
  client-core/       # shared reference sync state machine (web/mobile/tests)
  config/            # tsconfig/oxlint/oxfmt/etc
```

---

## 6) Feature inventory (granular, by area)

Internal tracking list, not customer-facing copy. Status values: **Implemented** (real code, tested), **Scaffolded** (schema/types/endpoints exist, not wired end-to-end), **Planned** (designed, not built).

### Identity & accounts

- Username + password authentication (better-auth) — Implemented
- Self-service signup disabled; accounts are admin-provisioned only — Implemented
- Per-school institution tenancy (`institutions` table, every domain row scoped by `institution_id`) — Implemented
- Bulk account creation via CSV upload (admin dashboard) — Planned (schema: `provisioning_batches`)
- Account creation via invite link — Planned (schema: `invites`; endpoints `POST /admin/invites`, `POST /invites/:token/redeem` not yet built)
- Role model: student / teacher / admin / compliance_officer / headmaster (`role_bindings`) — Implemented (read path: admin/headmaster check in report review; write path via direct DB insert only, no admin UI/endpoint yet)
- Public school directory / picker before login — Implemented, API-only (`apps/directory`: `GET /institutions?search=`, no-auth/no-PII, tested); no web UI for the picker yet
- Hosted vs. self-hosted deployment per institution, routed via control-plane resolve API — Implemented for the "hosted" path (`GET /institutions/:slug/resolve` returns `backend_url`); every row resolves to the single local backend for now — nothing yet provisions an actual `self_hosted` row

### Organizational structure

- Classes with a head teacher (Klassenlehrer) — Implemented (`classes.head_teacher_user_id`; resolved live in report-review dual-auth)
- Grades/levels — Scaffolded
- Subjects, tied to classes — Scaffolded
- Class membership lifecycle (active/removed) — Scaffolded
- Student council / subject assignment by class — Scaffolded

### Messaging & sync

- Canonical event-stream protocol (Zod schemas, versioned, WS + REST DTOs) — Implemented (`@repo/sync-protocol`)
- Per-user monotonic cursor semantics (progression/duplicate/out-of-order/stale-ack rules) — Implemented (`@repo/sync-protocol` runtime/cursor)
- Inbox-pattern delivery (per-user `user_event_stream`, worker-owned fan-out) — Implemented, verified end-to-end against live Postgres+Redis (`apps/worker/src/{inbox,processors}.ts`)
- `POST /messages` → enqueue → worker fan-out → per-recipient inbox row — Implemented, verified via real HTTP + automated test (`apps/api-gateway/src/routes/messages.ts`)
- `POST /sync` (cursor-paginated fetch) and `POST /ack` (monotonic-only, idempotent) — Implemented, verified (`apps/api-gateway/src/routes/sync.ts`)
- `WS /ws`: gap-check on `client.hello` → `server.sync.required`; live `event.notify` push on Redis wake signal — Implemented, verified against a real socket connection (`apps/api-gateway/src/ws.ts`)
- 1:1 chats (DM) — Implemented (messaging path works for `chats.type = 'dm'`; no dedicated `/chats` creation endpoint yet — rows created directly)
- Class/club-linked group chats with membership sync — Scaffolded (schema only; auto-membership-sync from class/club not built)
- Teacher-created ad-hoc groups — Scaffolded (`chats.type = 'adhoc'`)
- Message edit — Scaffolded (`messages.edited_at`)
- Message delete via tombstone (not hard delete) — Scaffolded (`messages.deleted_at`)
- Reconnect/offline catch-up — Implemented end-to-end, including a real client: shared reference state machine `@repo/client-core` (CONNECT → HELLO → SYNC_REQUIRED? → FETCH_LOOP → APPLY → ACK → LIVE, with reconnect backoff) verified against a real disconnect/reconnect cycle in the e2e harness
- Multi-device support per user — Scaffolded (`devices` table wired into MLS DS; sync-side multi-device fan-out not yet exercised)
- End-to-end test harness (real OpenMLS encryption, live push, offline catch-up, report-escrow dual-auth) — Implemented (`packages/client-core/src/test/e2e.test.ts`), spawns real gateway+worker processes against live Postgres+Redis

### End-to-end encryption (MLS)

- Real OpenMLS (RFC 9420) compiled to WASM, no stub — Implemented (`crates/mls-wasm`, `packages/mls`)
- Two-party group creation, key package exchange, Welcome, encrypt/decrypt — Implemented, verified against real wasm32 build from Bun
- Remove member from group — Planned (wasm wrapper only covers create/add)
- Multi-device key packages per user — Scaffolded (schema supports it; wasm wrapper is single-device per party)
- Persistent group/key-package storage (vs. current in-memory) — Planned (wasm side still uses in-memory `OpenMlsRustCrypto` storage)
- Server-side Delivery Service (device registration, key package upload/consume, group/member registration, one-time Welcome relay, group state fetch) — Implemented, verified end-to-end against real HTTP (`apps/api-gateway/src/routes/mls.ts`) — pure metadata relay, never touches wasm bindings or private keys

### Compliance & reporting

- Report-escrow: reporter re-encrypts a reported message to an institution compliance public key — Implemented (`@repo/crypto` seal/open primitives, tested)
- `POST /reports` — store ciphertext only, server never sees plaintext — Implemented, verified end-to-end (`apps/api-gateway/src/routes/reports.ts`)
- `POST /reports/:id/review` — dual-authorization (admin + reporter's Klassenlehrer, two *distinct* approvers within a 24h window) before decrypt — Implemented, verified end-to-end with real accounts (admin approves → `awaiting_second_approval`; Klassenlehrer approves → plaintext returned, matches original)
- Compliance private key custody — MVP stand-in via `COMPLIANCE_PRIVATE_KEY` env var, not real KMS (see ADR-0006); public half lives in `compliance_keys`
- Immutable, hash-chained audit log (`audit_log.prev_hash`) — Scaffolded (rows written on ack-advance and report-decrypt; hash-chaining itself — populating `prev_hash` — not yet wired)
- Institutional auditing mode (broader, policy-gated, dual-approval access beyond single reports) — Planned, deferred past MVP

### Other product surfaces (from product scope, not started)

- Institution-wide blackboard/news feed — Scaffolded (schema: `blackboard_posts`)
- Events module (institution-wide events, e.g. concerts) — Scaffolded (schema: `events`)
- Clubs directory with join requests (pending/approved/rejected/cancelled) — Scaffolded (schema: `clubs`, `club_memberships`, `join_requests`)
- Encrypted PII at rest with blind-index exact-match search — Implemented as primitives (`@repo/crypto`), applied to `profiles.display_name_ciphertext`; not yet applied to other PII fields
- Structured logging / correlation IDs across gateway → worker → notify — Planned
- Metrics, SLO dashboards, alerting — Planned
- Load testing, chaos/failure-injection testing — Planned
