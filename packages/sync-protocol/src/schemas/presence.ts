import { z } from 'zod';

export const presenceMessageSchema = z
  .object({
    userId: z.string().min(1),
    status: z.enum(['online', 'offline']),
    at: z.string().datetime(),
  })
  .strict();

export type PresenceMessage = z.infer<typeof presenceMessageSchema>;
