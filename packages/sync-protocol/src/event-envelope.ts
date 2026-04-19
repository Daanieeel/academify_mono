import { z } from 'zod';

import { cursorSchema } from './cursor';
import { eventTypeSchema } from './event-types';
import { payloadMetadataSchema } from './payload-metadata';
import { protocolVersionSchema } from './protocol-version';

export const userEventEnvelopeSchema = z
  .object({
    version: protocolVersionSchema,
    event_id: z.string().uuid(),
    user_id: z.string().min(1),
    cursor: cursorSchema,
    event_type: eventTypeSchema,
    entity_id: z.string().min(1),
    created_at: z.string().datetime(),
    payload_metadata: payloadMetadataSchema,
  })
  .strict();

export type UserEventEnvelope = z.infer<typeof userEventEnvelopeSchema>;
