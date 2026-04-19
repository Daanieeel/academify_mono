import { z } from 'zod';

export const presenceMessageSchema = z.object({
  userId: z.string().min(1),
  status: z.enum(['online', 'offline']),
  at: z.string().datetime(),
});

export const jobPayloadSchema = z.object({
  userId: z.string().min(1),
  operation: z.enum(['sync', 'reconcile']),
  correlationId: z.string().min(1),
});

export type PresenceMessage = z.infer<typeof presenceMessageSchema>;
export type JobPayload = z.infer<typeof jobPayloadSchema>;
