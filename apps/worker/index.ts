import { Worker } from 'bullmq';
import { getRedisConnectionOptions, queueNames } from '@repo/redis';
import { jobPayloadSchema } from '@repo/sync-protocol';

import { processJob } from './src/processors';

const worker = new Worker(
  queueNames.sync,
  async (job) => {
    const payload = jobPayloadSchema.parse(job.data);
    await processJob(payload);
    return { handled: true, command: payload.command };
  },
  { connection: getRedisConnectionOptions() },
);

console.log(`Worker active for queue: ${queueNames.sync}`);

worker.on('failed', (job, error) => {
  console.error(`Job ${job?.id ?? 'unknown'} failed`, error);
});
