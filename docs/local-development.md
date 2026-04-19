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

2. Create local env file from template:

```bash
cp .env.example .env
```

3. Start local infra (Postgres + Redis):

```bash
docker compose -f docker-compose.dev.yml up -d
```

4. Run database migrations:

```bash
cd packages/database
bunx prisma migrate dev
cd ../..
```

5. Start gateway + worker (from repo root):

```bash
bun run dev
```

6. Start web app in another terminal:

```bash
cd apps/web
bun run dev
```

Open web at `http://localhost:3000`.

## Environment Variables By App/Package

All local env vars come from the repo root `.env` file.

`docker-compose.dev.yml` now reads `.env` instead of hardcoding service env values.

### Root `.env`

Template: `.env.example`

- `POSTGRES_USER`: Postgres username used by the postgres container.
- `POSTGRES_PASSWORD`: Postgres password used by the postgres container.
- `POSTGRES_DB`: Default Postgres database created on container init.
- `POSTGRES_PORT`: Host port mapped to container port `5432`.
- `REDIS_HOST`: Redis host for Bun apps (defaults to `127.0.0.1`).
- `REDIS_PORT`: Host port mapped to Redis and used by Bun apps.
- `REDIS_USERNAME`: Optional Redis username.
- `REDIS_PASSWORD`: Optional Redis password.
- `API_GATEWAY_PORT`: Port for `@app/api-gateway`.
- `DATABASE_URL`: Prisma datasource URL used by `@repo/database`.

### apps/api-gateway

- Required:
  - `API_GATEWAY_PORT`
- Default if missing:
  - `3001`

### apps/worker

- Uses Redis settings from `@repo/redis`:
  - `REDIS_HOST`
  - `REDIS_PORT`
  - `REDIS_USERNAME` (optional)
  - `REDIS_PASSWORD` (optional)

### apps/web

- No environment variables are currently required in this app.

### apps/mobile

- No environment variables are currently required in this app.

### packages/database

- Required:
  - `DATABASE_URL`
- Used by:
  - `packages/database/prisma.config.ts`
  - Prisma migrations and schema operations

### packages/redis

- Reads:
  - `REDIS_HOST` (default `127.0.0.1`)
  - `REDIS_PORT` (default `6379`)
  - `REDIS_USERNAME` (optional)
  - `REDIS_PASSWORD` (optional)

## Running Migrations

From repository root:

```bash
cd packages/database
bunx prisma migrate dev
cd ../..
```

Useful additional commands:

```bash
# Regenerate Prisma client artifacts
cd packages/database && bunx prisma generate

# Open Prisma Studio
cd packages/database && bunx prisma studio
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

```bash
cd apps/mobile
bun run start
```

Then use Expo options in terminal to open iOS/Android/Web targets.

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

- If ports are occupied, change `POSTGRES_PORT` and/or `REDIS_PORT` in `.env`.

### Prisma migration fails with connection errors

- Confirm Postgres container is healthy:

```bash
docker compose -f docker-compose.dev.yml ps
```

- Validate `DATABASE_URL` in `.env` matches your Postgres user/password/db/port.

### API Gateway starts on wrong port

- Check `API_GATEWAY_PORT` in `.env`.
- Confirm no duplicate process is using the same port.

### Worker cannot connect to Redis

- Confirm Redis container is up:

```bash
docker compose -f docker-compose.dev.yml ps redis
```

- Verify `REDIS_HOST` and `REDIS_PORT` in `.env`.

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
