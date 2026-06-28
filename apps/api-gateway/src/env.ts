import { createEnv, databaseEnvSchema, redisEnvSchema, z } from '@repo/env';

// `COMPLIANCE_PRIVATE_KEY` is an MVP stand-in for real KMS custody (see
// ADR-0006) — the matching public half lives in `compliance_keys` in the DB.
// Optional because most routes don't need it; only the report review path does.
export const env = createEnv({
  server: {
    ...databaseEnvSchema,
    ...redisEnvSchema,
    API_GATEWAY_PORT: z.coerce.number().int().positive().default(3001),
    COMPLIANCE_PRIVATE_KEY: z.string().optional(),
    BETTER_AUTH_URL: z.string().url().default('http://localhost:3001'),
  },
  runtimeEnv: process.env,
});
