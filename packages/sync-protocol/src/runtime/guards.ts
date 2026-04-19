import {
  ackRequestDtoSchema,
  syncRequestDtoSchema,
  type AckRequestDto,
  type SyncRequestDto,
  type UserEventEnvelope,
  type WsMessage,
  userEventEnvelopeSchema,
  wsMessageSchema,
} from '../schemas';

export function isUserEventEnvelope(
  input: unknown,
): input is UserEventEnvelope {
  return userEventEnvelopeSchema.safeParse(input).success;
}

export function isWsMessage(input: unknown): input is WsMessage {
  return wsMessageSchema.safeParse(input).success;
}

export function isSyncRequestDto(input: unknown): input is SyncRequestDto {
  return syncRequestDtoSchema.safeParse(input).success;
}

export function isAckRequestDto(input: unknown): input is AckRequestDto {
  return ackRequestDtoSchema.safeParse(input).success;
}
