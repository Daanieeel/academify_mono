import type { RedisOptions } from 'ioredis';
import { createEnv, redisEnvSchema } from '@repo/env';

const env = createEnv({ server: redisEnvSchema, runtimeEnv: process.env });

export const channelNames = {
  presence: 'presence:events',
  syncBroadcast: 'sync:broadcast',
} as const;

export const queueNames = {
  sync: 'sync_jobs',
  notifications: 'notification_jobs',
} as const;

export const getRedisConnectionOptions = (): RedisOptions => {
  return {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    username: env.REDIS_USERNAME,
    password: env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
  };
};
