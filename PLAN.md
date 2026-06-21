MVP Plan — E2EE Messaging Engine (Academify)

Context

Academify is an E2E-encrypted chat platform for schools (web + mobile). The repo today has a
fully-built sync-protocol contract and real crypto/redis/auth primitives, but the data
layer, MLS core, and runtime apps are skeletons — two of them (worker, api-gateway) don't
even typecheck because they import schemas that were never defined (jobPayloadSchema,
presenceMessageSchema).

This plan builds the messaging MVP: a real E2EE message path using MLS (OpenMLS-via-WASM) +
the inbox (per-user event stream) delivery pattern, on a PostgreSQL schema via Drizzle
(replacing the empty Prisma setup). It includes the report-escrow compliance flow (a student
reports a message → their client re-encrypts the plaintext to an institution compliance key
→ admin + Klassenlehrer decrypt under dual-auth + audit, without a general E2EE backdoor).
The schema is designed to also accommodate every upcoming README feature
(classes/grades/subjects, blackboard, events, clubs/join-requests). Outcome: a backend that
proves send→encrypt→inbox→sync→decrypt→ack end-to-end, plus a shared reference-client state
machine.

Confirmed decisions

- Reporting: report-escrow — reporter re-encrypts to institution compliance pubkey; server
  stores ciphertext only; decrypt is dual-auth gated + audited. No institution-wide group
  backdoor.
- MLS: OpenMLS (Rust) compiled to WASM, wrapped by packages/mls. Server = Delivery Service
  only (never holds private keys).
- Auth: better-auth, username + password only (no other providers, no email magic-link).
  Self-signup disabled — accounts are admin-provisioned. Provisioning paths (future): bulk CSV
  upload of student names via admin dashboard, and invite links. MVP builds the auth core +
  schema/endpoint stubs for provisioning; admin-dashboard UI + CSV parsing deferred.
- Tenancy & topology: institution = school is a first-class tenant. The app is publicly
  available: users select their school before authenticating. Future deployment split — a
  school either hosts its own DB + backend (self-hosted) or is hosted by us (multi-tenant).
  This requires a central control plane (our public website + directory/resolution backend)
  that holds the global institution registry and routes each user to the correct backend for
  their school. MVP designs this boundary (data plane vs control plane) and implements the
  registry + public selection/resolution against a single backend; actual multi-deployment
  routing + self-hosting mechanics are deferred (scaffolded, not wired).
- Scope: Backend (db + worker + gateway + mls + reporting) + a shared reference-client
  module proving the full loop. Web/mobile UI screens deferred.

Hard constraints (from ADRs + README)

- Notify-over-WS, fetch-over-REST (ADR-0001). No heavy fan-out in gateway.
- Worker owns recipient resolution + per-user cursor sequencing (ADR-0002).
- Encrypted PII at rest; never encrypt operational/authz fields (institution_id, role
  bindings, membership FKs).
- Audit access = institutional_auditing_mode semantics: dual approval, immutable log,
  time-bounded, scope-limited (ADR-0004).
- TS6, prepping TS7: no baseUrl in tsconfigs (root AGENTS.md).

---

Phase 0 — Drizzle migration + unblock typecheck (foundation)

Switch ORM (supersedes ADR-0003):

- packages/database: remove @prisma/client + prisma; add drizzle-orm, drizzle-kit, postgres
  (postgres-js driver — Bun-compatible).
- Delete prisma/ + prisma.config.ts; add drizzle.config.ts (schema glob, out: ./drizzle,
  dialect: postgresql, dbCredentials.url: DATABASE_URL).
- Replace stub packages/database/index.ts with a real client: export const db =
  drizzle(postgres(process.env.DATABASE_URL!)) + re-export all schema tables and inferred
  types.
- Schema lives in packages/database/src/schema/\*.ts (one file per domain, barrel
  schema/index.ts).
- Migrations via drizzle-kit generate + drizzle-kit migrate.

Fix the two broken imports (currently fail turbo run typecheck):

- worker/index.ts imports jobPayloadSchema — define in sync-protocol (Phase 2 command
  schemas).
- api-gateway/src/index.ts imports presenceMessageSchema — define in sync-protocol (presence
  schema) or repoint to wsMessageSchema.

Auth (better-auth):

- packages/auth repurposed to wrap better-auth: server instance with the username + password
  plugin only; the custom createSessionId/parseSessionPayload stubs are removed (or kept only
  as thin internal helpers). Export the server auth instance, its handler, and a
  session-validation helper for gateway middleware.
- better-auth Drizzle adapter over @repo/database — its tables (user, session, account,
  verification) live in packages/database/src/schema/auth.ts so migrations stay unified.
- emailAndPassword disabled; username/password enabled; signUp self-service disabled
  (server-side account creation only).
- Add better-auth dep; zod already present.

Docs/ADR:

- New docs/adr/0005-drizzle-over-prisma.md (Status: Accepted, Supersedes: ADR-0003).
- New docs/adr/0006-report-escrow-compliance-model.md (refines ADR-0004 for MVP;
  institution-wide auditing mode deferred).
- New docs/adr/0007-better-auth-username-password.md (better-auth, username+password only,
  admin-provisioned accounts).
- Update README.md stack line (Drizzle, not Prisma; better-auth) and
  docs/local-development.md migration commands (drizzle-kit not prisma migrate).

---

Phase 1 — PostgreSQL schema (Drizzle)

Files under packages/database/src/schema/. Implement + migrate all (messaging tables are
exercised now; the rest are created so upcoming features drop in without a second migration
wave). Encrypted fields stored as text/bytea ciphertext from @repo/crypto; operational/authz
fields stay plaintext for joins.

auth.ts — better-auth core tables via its Drizzle adapter: user (id, username unique, name,
...), session, account (holds password hash for username+password), verification. username
is operational (login) → plaintext. No email required.

identity.ts — institutions (id, slug unique, display_name, region, deployment_mode
hosted|self_hosted, status, created_at — the local tenant record; every domain row is scoped
by institution_id); profiles (user_id → user.id, institution_id, display_name_ciphertext,
key_version, photo_ref — encrypted PII separated from the auth identity per ADR
data-protection rule); roles enum (student|teacher|admin|compliance_officer|headmaster);
role_bindings (user_id, role, scope). invites (id, token, institution_id, class_id?, role,
expires_at, consumed_at, created_by) and provisioning_batches (id, institution_id, source
csv|invite, status, created_by, created_at) — schema for the future CSV-import + invite-link
account provisioning; endpoints stubbed (Phase 6), admin UI deferred.

org.ts — grades, subjects, classes (id, institution_id, name, grade_id, head_teacher_user_id
= Klassenlehrer), class_memberships (user_id, class_id, role, state), subject_assignments.

chats.ts — chats (id, institution_id, type dm|class|club|adhoc, title_ciphertext?,
linked_class_id?, linked_club_id?, created_by), chat_members (chat_id, user_id, state
active|removed, role, joined_at, removed_at). Index (chat_id, state) for recipient
resolution.

mls.ts — devices (id, user_id, label, identity_pubkey, revoked_at), key_packages (id,
device_id, key_package_bytes bytea, consumed_at — one-time-use), mls_groups (id, chat_id
unique, mls_group_id, current_epoch, cipher_suite), mls_group_members (group_id, user_id,
device_id, leaf_index, added_epoch, removed_epoch).

messaging.ts (CORE) —

- messages (id, chat_id, sender_user_id, sender_device_id, mls_epoch, ciphertext bytea,
  content_type, created_at, edited_at, deleted_at tombstone).
- user_event_stream (inbox): event_id uuid, user_id, cursor bigint, event_type, entity_id,
  created_at, payload_metadata jsonb, payload_ref. Indexes: unique (user_id, cursor),
  (user_id, created_at), (event_id). Mirrors userEventEnvelopeSchema.
- user_cursor_state (user_id pk, next_cursor bigint, last_ack_cursor bigint, updated_at) —
  per-user monotonic allocation + ack target.

compliance.ts (CORE) —

- compliance_keys (institution_id, key_version, public_key bytea, active) — private key held
  in secrets store/KMS, never in DB.
- reports (id, institution_id, reporter_user_id, reported_message_id, chat_id, status
  pending|reviewing|resolved|dismissed, created_at, resolved_by, resolved_at).
- report_packages (report_id, encrypted_package bytea, compliance_key_version,
  content_hash).
- audit_log (id, institution_id, actor_user_id, action, target_type, target_id, metadata
  jsonb, created_at, prev_hash — hash chain for tamper-evidence).
- auditing_sessions (schema stub for future institution-wide mode: requested_by,
  approver_ids[], scope, expires_at, status).

feeds.ts (future-prep, created not wired) — blackboard_posts, events, clubs,
club_memberships, join_requests.

Cursor allocation rule (worker, single tx): SELECT ... FOR UPDATE on user_cursor_state →
bump next_cursor → insert user_event_stream row. Guarantees strict monotonic per-user cursor
(README §3, ADR-0002).

---

Phase 2 — sync-protocol: command schemas + cursor utility

packages/sync-protocol/src/. Extends the existing (already-real) contract.

- schemas/commands.ts — gateway→worker queue job payloads (discriminated union on command):
  SEND_MESSAGE, MEMBERSHIP_CHANGED, PROFILE_UPDATED, BLACKBOARD_POSTED, EVENT_UPDATED,
  CLUB_UPDATED. Export jobPayloadSchema (the union) — fixes worker import.
- schemas/presence.ts — presenceMessageSchema (userId, status online|offline, at) — fixes
  gateway import; add to wsMessageSchema union if presence travels over WS.
- runtime/cursor.ts (Ticket 1.2) — validateCursorProgression, computeNextSyncWindow,
  isDuplicateOrOutOfOrder, isStaleAck. Documented invariants in comments. Unit tests for
  duplicate / gap / out-of-order / stale-ack.
- Bump exports in src/index.ts; extend contract tests.

---

Phase 3 — crypto: report-escrow envelope

packages/crypto/index.ts (currently only symmetric AES-256-GCM + blind index). Add
asymmetric seal/open using Node built-ins only (no new dep):

- generateComplianceKeyPair() → X25519 keypair.
- sealToPublicKey(plaintext, recipientPubKey): ephemeral X25519 → ECDH → HKDF → AES-256-GCM
  (reuse encryptText internals); output = ephemeral pubkey ‖ iv ‖ tag ‖ ciphertext.
- openWithPrivateKey(sealed, privKey): inverse.
- Unit tests: round-trip, tamper-detection, wrong-key rejection.

This is the cryptographic basis of report-escrow: reporter seals to
compliance_keys.public_key; only the gated reviewer holds the private key.

---

Phase 4 — packages/mls: OpenMLS WASM wrapper

- crates/mls-wasm/ (new Rust crate): openmls + wasm-bindgen, built with wasm-pack → JS+.wasm
  artifact. Build script wired into packages/mls build (document the toolchain prereq:
  rustup, wasm-pack).
- packages/mls/src/ wraps the WASM module with a typed client API over the existing
  interfaces (GroupId, MlsEpoch, MlsMember, MlsGroupState, MlsCommitMessage):
  - Client-side: generateKeyPackage, createGroup, addMember/removeMember (→ Commit +
    Welcome), encryptApplicationMessage, decryptApplicationMessage, epoch/state persistence
    hooks.
  - Server-side Delivery Service contracts (no private keys): store/consume key packages,
    route Commit/Welcome/ciphertext.
- Mobile caveat (deferred): Expo/RN WASM loading is the hard part — reference client targets
  Bun/web first; RN native-module path documented as a follow-up, not in MVP.

---

Phase 5 — worker: inbox fan-out processors

apps/worker. Replace the stub generic processor. One processor per command from
jobPayloadSchema; SEND_MESSAGE is the MVP-critical path:

1.  Persist messages row (ciphertext — worker never decrypts).
2.  Resolve recipients = active chat_members (worker-owned, ADR-0002).
3.  Per recipient, allocate per-user cursor (Phase 1 rule) + insert user_event_stream
    message.created row.
4.  After durable write, publish Redis wake signal (channelNames.syncBroadcast, per-user
    payload).

MEMBERSHIP_CHANGED / PROFILE_UPDATED / BLACKBOARD_POSTED / EVENT_UPDATED / CLUB_UPDATED
follow the same write-then-wake shape (membership + profile wired for MVP; feed events
stubbed). Tests: recipient resolution, monotonic cursor under concurrent appends,
publish-after-write ordering.

---

Phase 6 — api-gateway: auth + sync/ack + WS + MLS DS + reporting

apps/api-gateway (Elysia, already running). Mount the better-auth handler (username+password
login/logout/session) from @repo/auth, and add auth middleware validating the better-auth
session + deriving institution context, applied to REST + WS.

Account provisioning (stubs for MVP, UI deferred): POST /admin/invites (create invite link —
gated to admin role), POST /invites/:token/redeem (set username+password against a
pre-provisioned account), POST /admin/import (accept CSV of student names →
provisioning_batches + pending user rows). Self-signup stays disabled; these are the only
account-creation paths.

Messaging:

- POST /messages → validate, enqueue SEND_MESSAGE (no fan-out in gateway).
- POST /sync → read user_event_stream where cursor > after_cursor for the authed user, ASC,
  limit, compute has_more+next_cursor → SyncResponseDto. Index-backed, deterministic,
  idempotent.
- POST /ack → advance user_cursor_state.last_ack_cursor only if greater (reject stale);
  write audit_log entry → AckResponseDto.
- WS /ws → on client.hello{last_ack_cursor}: gap check vs latest cursor → emit
  server.sync.required if behind; subscribe to Redis wake channel → push event.notify on
  signal.

MLS Delivery Service: upload key package; fetch+consume a recipient key package (for group
add); post/fetch Commit+Welcome; fetch group membership/epoch.

Reporting (report-escrow):

- POST /reports → store reports + report_packages.encrypted_package (sealed client-side to
  compliance key). Server stores ciphertext only.
- POST /reports/:id/review → dual-auth gated (admin + Klassenlehrer of reporter's class,
  derived via classes.head_teacher_user_id); on approval, openWithPrivateKey returns plaintext
  to the authorized reviewer and writes an immutable audit_log entry. Time-bounded review
  session.

---

Phase 7 — reference client (shared TS module)

New shared module (e.g. packages/client-core/ or apps/web/lib/sync/) — the canonical state
machine for web + mobile (README §3, Ticket 1.8):

CONNECT → HELLO(last_ack_cursor) → (SYNC_REQUIRED?) → FETCH_LOOP /sync → APPLY + MLS decrypt
→ ACK → LIVE(event.notify) with documented retry/backoff. Consumes @repo/sync-protocol
(contract + runtime/cursor), @repo/mls (group ops + decrypt), @repo/crypto (report sealing).

End-to-end harness (proves the MVP): two simulated users → create MLS group on a chat → user
A encryptApplicationMessage + POST /messages → worker fans out to inbox + wakes → user B
syncs, decrypts, acks → user B reports the message: seals plaintext to compliance key, POST
/reports → reviewer dual-auth decrypt + audit entry asserted.

---

Phase 8 — control plane / school directory (scaffold + boundary)

Establish the data-plane / control-plane split so self-hosting and hosted tenants can
coexist later, without committing to multi-deployment now.

- Control plane (global, always ours): institution registry — institution_registry (id, slug
  unique, display_name, region, deployment_mode hosted|self_hosted, backend_url, status,
  created_at). Public endpoints: GET /institutions?search= (school picker — only safe public
  fields) and GET /institutions/:slug/resolve → returns the backend_url + connection metadata
  the client should connect to. No auth, no PII.
- New apps/directory (scaffold): our public website + resolution API that owns
  institution_registry. For MVP it resolves every school to the single local backend
  (api-gateway); the contract is shaped so a self_hosted school later resolves to its own
  backend_url.
- Client flow: public web → select school (directory search) → resolve backend_url → connect
  to that gateway → better-auth login → messaging. The reference client (Phase 7) takes
  backend_url as config so the same loop works regardless of tenant deployment.
- Boundary discipline: the per-backend institutions table (data plane) is the local tenant
  record; institution_registry (control plane) is the global routing record. Keeping them
  distinct is what makes self-hosting a deployment change, not a rewrite. Full
  multi-deployment provisioning + per-tenant secrets/keys = deferred.
- ADR: docs/adr/0008-control-plane-data-plane-tenancy.md (registry-routed tenancy; hosted +
  self-hosted backends).

websocket app

apps/websocket is a bare stub and the gateway already owns /ws. Leave as a placeholder for a
future dedicated WS-scale tier (out of MVP scope); note in its README. No work this round.

---

Critical files

- packages/database/{package.json,index.ts,drizzle.config.ts,src/schema/\*.ts} — ORM switch +

* self-hosted backends).

websocket app

apps/websocket is a bare stub and the gateway already owns /ws. Leave as a placeholder for
a future dedicated WS-scale tier (out of MVP scope); note in its README. No work this
round.

---

Critical files

- packages/database/{package.json,index.ts,drizzle.config.ts,src/schema/\*.ts} — ORM switch

* schema (incl. schema/auth.ts better-auth tables)
  - packages/database/{package.json,index.ts,drizzle.config.ts,src/schema/\*.ts} — ORM
    switch + schema (incl. schema/auth.ts better-auth tables)
  - packages/auth/{package.json,index.ts} — better-auth server instance (username+password,
    signup disabled) + session-validation helper
  - packages/sync-protocol/src/schemas/{commands,presence}.ts, src/runtime/cursor.ts — fix
    broken imports + cursor logic
  - packages/crypto/index.ts — report-escrow seal/open
  - crates/mls-wasm/_, packages/mls/src/_ — OpenMLS WASM wrapper
  - apps/worker/index.ts (+ src/processors/\*) — inbox fan-out
  - apps/api-gateway/src/\* — auth, /sync, /ack, /ws, MLS DS, /reports
  - packages/client-core/\* — reference state machine + e2e harness (takes backend_url from
    directory resolution)
  - apps/directory/\* — control-plane scaffold: public school picker + institution_registry
  * resolve API
  - docs/adr/0005-_.md, docs/adr/0006-_.md, README.md, docs/local-development.md

  Reuse (don't rebuild)
  - @repo/sync-protocol: userEventEnvelopeSchema, wsMessageSchema, REST DTOs,
    builders/parsers/guards — already done.
  - @repo/crypto: encryptText/decryptText/createBlindIndex — extend, reuse internals for
    seal/open.
  - @repo/redis: channelNames, queueNames, getRedisConnectionOptions — already
    production-shaped.
  - @repo/auth: rebuilt on better-auth (the prior createSessionId/parseSessionPayload
    custom stubs are replaced — they were placeholder, not load-bearing).

  ---

  Verification (end-to-end)
  1.  docker compose -f docker-compose.dev.yml up -d (postgres:16 + redis:7; env from .env).
  2.  cd packages/database && bunx drizzle-kit migrate → schema applies clean.
  3.  bun run typecheck → all 11 packages green (worker + gateway imports fixed).
  4.  bun run test → sync-protocol contract + new cursor tests + crypto seal/open round-trip
  - worker processor (recipient resolution, monotonic cursor) all pass.
  5.  bun run dev (gateway + worker), then run the Phase 7 e2e harness: provision two
      accounts (admin path) → username+password login via better-auth → assert A→B encrypted
      delivery via inbox+sync+ack, and a report sealed → reviewer dual-auth decrypt → matching
      plaintext + audit_log entry. Confirm self-signup is rejected.
  6.  Manual cursor checks: stale /ack rejected; reconnect with gap triggers
      server.sync.required; duplicate delivery deduped client-side.

  Sequencing

  Phase 0 → 1 → 2 (unblocks typecheck + schema + contract) are prerequisites. Phase 3
  (crypto) and Phase 4 (MLS WASM) parallelizable. Phase 5 (worker) needs 1+2; Phase 6
  (gateway) needs 1+2+3+4; Phase 7 needs 4+5+6. Phase 8 (control plane / directory) is
  independent of 3–6 and can land anytime after Phase 1.
