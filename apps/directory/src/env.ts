import { createEnv, databaseEnvSchema, z } from '@repo/env';

export const env = createEnv({
  server: {
    ...databaseEnvSchema,
    DIRECTORY_PORT: z.coerce.number().int().positive().default(3002),
  },
  runtimeEnv: process.env,
});
