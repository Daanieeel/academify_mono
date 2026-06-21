# Local Development Setup

This guide is for getting the core local stack running fast:

- Postgres + Redis via Docker Compose
- API Gateway
- Worker
- Web app
- Mobile app (optional for core backend flow)

If you follow the steps in order, you should be able to run the core stack in under 30 minutes.

## Prerequisites

Install the following tools before starting:

- Bun `1.3.5` (repository package manager)
- Docker Desktop (or Docker Engine + Compose plugin)
- Node.js `20+` (recommended for Next.js and Expo toolchain compatibility)
- Xcode (for iOS simulator) and/or Android Studio (for Android emulator) if running mobile

Verify quickly:

```bash
bun --version
docker --version
docker compose version
node --version
```

## 30-Minute Quick Start

1. Install dependencies at repo root:

```bash
bun install
```

2. Create local env files from templates (root, for docker-compose, plus each app/package that connects to Postgres/Redis):

```bash
cp .env.example .env
cp packages/database/.env.example packages/database/.env
cp packages/redis/.env.example packages/redis/.env
cp apps/worker/.env.example apps/worker/.env
cp apps/api-gateway/.env.example apps/api-gateway/.env
cp apps/directory/.env.example apps/directory/.env
cp apps/mobile/.env.example apps/mobile/.env
```

3. Start local infra (Postgres + Redis):

```bash
docker compose -f docker-compose.dev.yml up -d
```

4. Run database migrations:

```bash
cd packages/database
bunx drizzle-kit generate
bunx drizzle-kit migrate
cd ../..
```

5. Start gateway + worker (from repo root):

```bash
bun run dev
```

6. Seed sample data (institution, admin/teacher/student accounts, a few DM chats) — needs the gateway+worker from step 5 running, since it hashes passwords through `@repo/auth`:

```bash
cd apps/api-gateway
bun run seed
cd ../..
```

Prints the seeded usernames and the shared password to the terminal. Safe to re-run — it skips creation if the demo institution already exists.

7. Start web app in another terminal:

```bash
cd apps/web
bun run dev
```

Open web at `http://localhost:3000`.

## Environment Variables By App/Package

Env vars are handled **locally per app/package**, each with its own `.env` +
`.env.example` — not a single shared root file. Bun only auto-loads `.env`
from the process's current working directory, and that's exactly how every
script in this repo runs (turbo, and `cd <pkg> && bun run ...`), so each
app/package that needs env vars at runtime owns its own `.env`.

Validation goes through `@repo/env` (a thin wrapper around
`@t3-oss/env-core`): `@repo/database` and `@repo/redis` validate their own env
vars at import time and throw a clear error if something required is missing
or malformed, instead of silently reading `undefined` from `process.env`.

### Root `.env`

Template: `.env.example`. **Docker-compose infra only** — not read by any app:

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: passed into the postgres container on init.
- `POSTGRES_PORT`: host port mapped to the postgres container's `5432`.
- `REDIS_PORT`: host port mapped to the redis container's `6379`.

### apps/api-gateway

Template: `apps/api-gateway/.env.example`.

- `API_GATEWAY_PORT` (default `3001` if missing)
- `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD` — same shape as below, since the gateway imports `@repo/database` and `@repo/redis` directly.

### apps/worker

Template: `apps/worker/.env.example`.

- `DATABASE_URL`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME` (optional), `REDIS_PASSWORD` (optional)

### apps/directory

Template: `apps/directory/.env.example`. This is the **control plane** (ADR-0009) — a separate service with its own migration history; it does not import `@repo/database`, even though it points at the same local Postgres instance for setup convenience.

- `DATABASE_URL` — its own `institution_registry` table, not the per-tenant `institutions` table.
- `DIRECTORY_PORT` (default `3002` if missing)

### apps/web

- No environment variables are currently required in this app.

### apps/mobile

Template: `apps/mobile/.env.example`. Expo only inlines vars prefixed
`EXPO_PUBLIC_*` into the client bundle — that's why this is the one app where
the var name itself has that prefix.

- `EXPO_PUBLIC_API_URL` (default `http://localhost:3001`) — the gateway URL the app talks to for auth/REST/WS. `localhost` works for the iOS Simulator; a physical device or Android emulator needs your machine's LAN IP instead (the device can't resolve your dev machine's `localhost`).

### packages/database

Template: `packages/database/.env.example`.

- `DATABASE_URL` — validated via `@repo/env`. Used by `packages/database/index.ts` (the Drizzle client) and `drizzle.config.ts` (CLI migrations).

### packages/redis

Template: `packages/redis/.env.example`.

- `REDIS_HOST` (default `127.0.0.1`), `REDIS_PORT` (default `6379`), `REDIS_USERNAME` (optional), `REDIS_PASSWORD` (optional) — validated via `@repo/env`.

## Running Migrations

From repository root:

```bash
cd packages/database
bunx drizzle-kit generate
bunx drizzle-kit migrate
cd ../..
```

`apps/directory` has its own, separate migration history:

```bash
cd apps/directory
bunx drizzle-kit generate
bunx drizzle-kit migrate
cd ../..
```

Useful additional commands:

```bash
# Open Drizzle Studio
cd packages/database && bunx drizzle-kit studio
```

## Starting Apps

From repository root:

### Gateway + Worker

```bash
bun run dev
```

### Gateway + Worker + Web

```bash
bun run dev:all
```

### Web only

```bash
cd apps/web
bun run dev
```

### Mobile

Requires the gateway + worker running (step 5) and sample data seeded (step
6) — the app has no offline/mock mode, every screen talks to the real
backend.

```bash
cd apps/mobile
bun run start
```

Then use Expo options in terminal to open iOS/Android/Web targets. Log in
with one of the seeded usernames (e.g. `alice` / `Demo1234!` from the seed
script's printed summary).

On a physical device or Android emulator, set `EXPO_PUBLIC_API_URL` in
`apps/mobile/.env` to your machine's LAN IP (not `localhost`) before starting,
since the device needs to reach your dev machine over the network.

Real on-device E2EE (OpenMLS via WASM) runs inside a hidden `react-native-webview`
rather than directly in the app's JS engine — see
`docs/adr/0010-mls-wasm-webview-bridge-for-mobile.md` for why. This works in
both Expo Go and a dev client; no extra native build step is needed for it.

Known limitation: MLS group state is in-memory only (no persistence provider
yet — see ADR-0008/ADR-0010). Killing the app loses any chat's established
encryption state; reopening it will fail to decrypt that chat's messages
rather than silently showing plaintext. This is expected for now, not a bug.

### Directory (control plane)

```bash
cd apps/directory
bun run dev
```

## Tests, Lint, Format, Typecheck

From repository root:

```bash
# Lint everything
bun run lint

# Typecheck everything
bun run typecheck

# Run tests across workspaces
bun run test

# Check formatting
bun run format:check
```

## Troubleshooting

### Docker services do not start

- Check Docker is running.
- Re-run with logs:

```bash
docker compose -f docker-compose.dev.yml up
```

- If ports are occupied, change `POSTGRES_PORT` and/or `REDIS_PORT` in the root `.env` — and update the matching `DATABASE_URL`/`REDIS_PORT` in every app/package `.env` that connects to them.

### Drizzle migration fails with connection errors

- Confirm Postgres container is healthy:

```bash
docker compose -f docker-compose.dev.yml ps
```

- Validate `DATABASE_URL` in `packages/database/.env` matches your Postgres user/password/db/port.

### API Gateway starts on wrong port

- Check `API_GATEWAY_PORT` in `apps/api-gateway/.env`.
- Confirm no duplicate process is using the same port.

### Worker cannot connect to Redis

- Confirm Redis container is up:

```bash
docker compose -f docker-compose.dev.yml ps redis
```

- Verify `REDIS_HOST` and `REDIS_PORT` in `apps/worker/.env`.

### Bun dependency issues

- Ensure Bun version is up to date with repo expectations.
- Clean and reinstall:

```bash
rm -rf node_modules
bun install
```

### Mobile app fails to launch emulator/simulator

- Ensure Xcode/Android Studio SDK setup is complete.
- Run `bun run start` in `apps/mobile`, then choose a target from Expo CLI.

### Mobile login fails or every request 401s

- Confirm `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` points at a reachable gateway (LAN IP, not `localhost`, for a physical device/emulator).
- The mobile app's scheme (`academifyv3://`, in `apps/mobile/app.json`) must match the `trustedOrigins` entry in `packages/auth/index.ts` — better-auth rejects requests from an untrusted origin.

### Metro bundling fails with "Cannot find module '@babel/plugin-transform-react-jsx'" (or similar)

This is why root `bunfig.toml` sets `[install]\nlinker = "hoisted"`: Metro resolves Babel plugins relative to `@babel/core`'s own install location, not relative to the preset (`babel-preset-expo`) that declares them as a dependency — that breaks under Bun's default per-package `node_modules` isolation. If you see this error, your `node_modules` predates that setting:

```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
bun install
```
