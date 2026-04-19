import { z } from 'zod';

import { cursorSchema } from './cursor';
import { protocolVersionSchema } from './protocol-version';
import { userEventEnvelopeSchema } from './event-envelope';

export const clientHelloMessageSchema = z
  .object({
    version: protocolVersionSchema,
    type: z.literal('client.hello'),
    last_ack_cursor: cursorSchema,
  })
  .strict();

export const serverSyncRequiredMessageSchema = z
  .object({
    version: protocolVersionSchema,
    type: z.literal('server.sync.required'),
    required_after_cursor: cursorSchema,
  })
  .strict();

export const liveEventNotifyMessageSchema = z
  .object({
    version: protocolVersionSchema,
    type: z.literal('event.notify'),
    event: userEventEnvelopeSchema,
  })
  .strict();

export const wsMessageSchema = z.discriminatedUnion('type', [
  clientHelloMessageSchema,
  serverSyncRequiredMessageSchema,
  liveEventNotifyMessageSchema,
]);

export type ClientHelloMessage = z.infer<typeof clientHelloMessageSchema>;
export type ServerSyncRequiredMessage = z.infer<
  typeof serverSyncRequiredMessageSchema
>;
export type LiveEventNotifyMessage = z.infer<
  typeof liveEventNotifyMessageSchema
>;
export type WsMessage = z.infer<typeof wsMessageSchema>;
