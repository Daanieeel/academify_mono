import type { RedisOptions } from "ioredis";

export const channelNames = {
	presence: "presence:events",
	syncBroadcast: "sync:broadcast",
} as const;

export const queueNames = {
	sync: "sync_jobs",
	notifications: "notification_jobs",
} as const;

export const getRedisConnectionOptions = (): RedisOptions => {
	return {
		host: process.env.REDIS_HOST ?? "127.0.0.1",
		port: Number(process.env.REDIS_PORT ?? 6379),
		username: process.env.REDIS_USERNAME || undefined,
		password: process.env.REDIS_PASSWORD || undefined,
		maxRetriesPerRequest: null,
	};
};