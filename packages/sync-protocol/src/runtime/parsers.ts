import {
  ackRequestDtoSchema,
  syncRequestDtoSchema,
  syncResponseDtoSchema,
  type AckRequestDto,
  type SyncRequestDto,
  type SyncResponseDto,
  type UserEventEnvelope,
  type WsMessage,
  userEventEnvelopeSchema,
  wsMessageSchema,
} from '../schemas';

export function parseUserEventEnvelope(input: unknown): UserEventEnvelope {
  return userEventEnvelopeSchema.parse(input);
}

export function parseWsMessage(input: unknown): WsMessage {
  return wsMessageSchema.parse(input);
}

export function parseSyncRequestDto(input: unknown): SyncRequestDto {
  return syncRequestDtoSchema.parse(input);
}

export function parseSyncResponseDto(input: unknown): SyncResponseDto {
  return syncResponseDtoSchema.parse(input);
}

export function parseAckRequestDto(input: unknown): AckRequestDto {
  return ackRequestDtoSchema.parse(input);
}
