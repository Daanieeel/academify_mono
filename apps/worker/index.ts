import { Worker } from "bullmq";
import { createSessionId } from "@repo/auth";
import { getRedisConnectionOptions } from "@repo/redis";
import { jobPayloadSchema } from "@repo/sync-protocol";

const SYNC_QUEUE_NAME = "sync_jobs";

const worker = new Worker(
	SYNC_QUEUE_NAME,
	async (job) => {
		const payload = jobPayloadSchema.parse(job.data);
		return {
			handled: true,
			userId: payload.userId,
			sessionId: createSessionId(payload.userId),
		};
	},
	{ connection: getRedisConnectionOptions() },
);

console.log(`Worker active for queue: ${SYNC_QUEUE_NAME}`);

worker.on("failed", (job, error) => {
	console.error(`Job ${job?.id ?? "unknown"} failed`, error);
});