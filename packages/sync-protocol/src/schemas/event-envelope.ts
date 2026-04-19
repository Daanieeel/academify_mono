import { z } from 'zod';

import {
  cursorSchema,
  eventTypeSchema,
  payloadMetadataSchema,
  protocolVersionSchema,
} from './core';

export const userEventEnvelopeSchema = z
  .object({
    version: protocolVersionSchema,
    event_id: z.uuid(),
    user_id: z.string().min(1),
    cursor: cursorSchema,
    event_type: eventTypeSchema,
    entity_id: z.string().min(1),
    created_at: z.string().datetime(),
    payload_metadata: payloadMetadataSchema,
  })
  .strict();

export type UserEventEnvelope = z.infer<typeof userEventEnvelopeSchema>;
