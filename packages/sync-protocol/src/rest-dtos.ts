import { z } from 'zod';

import { cursorSchema } from './cursor';
import { protocolVersionSchema } from './protocol-version';
import { userEventEnvelopeSchema } from './event-envelope';

export const syncRequestDtoSchema = z
  .object({
    version: protocolVersionSchema,
    after_cursor: cursorSchema.optional(),
    limit: z.number().int().min(1).max(500).default(100),
  })
  .strict();

export const syncResponseDtoSchema = z
  .object({
    version: protocolVersionSchema,
    events: z.array(userEventEnvelopeSchema),
    next_cursor: cursorSchema,
    has_more: z.boolean(),
  })
  .strict();

export const ackRequestDtoSchema = z
  .object({
    version: protocolVersionSchema,
    last_ack_cursor: cursorSchema,
  })
  .strict();

export const ackResponseDtoSchema = z
  .object({
    version: protocolVersionSchema,
    accepted: z.boolean(),
    acknowledged_cursor: cursorSchema,
  })
  .strict();

export type SyncRequestDto = z.infer<typeof syncRequestDtoSchema>;
export type SyncResponseDto = z.infer<typeof syncResponseDtoSchema>;
export type AckRequestDto = z.infer<typeof ackRequestDtoSchema>;
export type AckResponseDto = z.infer<typeof ackResponseDtoSchema>;
