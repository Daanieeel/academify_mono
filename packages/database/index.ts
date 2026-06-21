import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { createEnv, databaseEnvSchema } from '@repo/env';
import * as schema from './src/schema/index';

const env = createEnv({ server: databaseEnvSchema, runtimeEnv: process.env });

const queryClient = postgres(env.DATABASE_URL);

export const db = drizzle(queryClient, { schema });

export * from './src/schema/index';
