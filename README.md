# academify_mono

## 1) Product scope (organized)

## Core product
A secure communication platform (web + mobile) for schools/universities:
- 1:1 teacher/professor ↔ student chats
- Class/club group chats with automatic membership sync
- Teacher-created ad-hoc groups
- Institution-wide blackboard/news feed
- Events module
- Clubs directory (join/request) with dedicated chats

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
- DB ORM: **Prisma**
- Redis: queue + pub/sub + ephemeral presence/sync signals

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

packages/
  database/          # Prisma schema, migrations, client
  mls/               # MLS group/session/key utilities
  crypto/            # envelope encryption, blind index helpers
  redis/             # shared Redis clients, channels, queue config
  sync-protocol/     # shared event contracts, zod schemas, cursor logic
  auth/              # shared auth/session helpers
  config/            # tsconfig/oxlint/oxfmt/etc
```