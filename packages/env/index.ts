import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export { createEnv };
export { z };

// Reusable Zod schema fragments for env vars shared by multiple
// apps/packages. Each consumer calls `createEnv` itself (composing whichever
// fragments it needs) against its OWN process.env — populated from its own
// local `.env` file, not a shared root one (see docs/local-development.md).

export const databaseEnvSchema = {
  DATABASE_URL: z.string().min(1),
};

export const redisEnvSchema = {
  REDIS_HOST: z.string().min(1).default('127.0.0.1'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_USERNAME: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
};
