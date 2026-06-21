import { Queue } from 'bullmq';
import { getRedisConnectionOptions, queueNames } from '@repo/redis';
import type { JobPayload } from '@repo/sync-protocol';

const syncQueue = new Queue(queueNames.sync, {
  connection: getRedisConnectionOptions(),
});

// Gateway enqueues intents only — recipient resolution and sequencing happen
// in the worker (ADR-0002). No fan-out logic belongs here.
export async function enqueueJob(payload: JobPayload): Promise<void> {
  await syncQueue.add(payload.command, payload);
}
