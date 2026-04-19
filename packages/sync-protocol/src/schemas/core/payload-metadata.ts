import { z } from 'zod';

export const payloadMetadataSchema = z
  .object({
    encryption: z.enum(['none', 'mls', 'envelope']).default('none'),
    key_version: z.number().int().positive().optional(),
    content_type: z.string().min(1),
    size_bytes: z.number().int().nonnegative().optional(),
    payload_ref: z.string().min(1).optional(),
    schema_version: z.string().min(1).optional(),
  })
  .strict();

export type PayloadMetadata = z.infer<typeof payloadMetadataSchema>;
