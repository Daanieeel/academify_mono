import {
  ackRequestDtoSchema,
  clientHelloMessageSchema,
  liveEventNotifyMessageSchema,
  PROTOCOL_VERSION,
  serverSyncRequiredMessageSchema,
  syncRequestDtoSchema,
  syncResponseDtoSchema,
  type AckRequestDto,
  type ClientHelloMessage,
  type LiveEventNotifyMessage,
  type ProtocolVersion,
  type ServerSyncRequiredMessage,
  type SyncRequestDto,
  type SyncResponseDto,
  type UserEventEnvelope,
  userEventEnvelopeSchema,
} from '../schemas';

export type UserEventEnvelopeInput = Omit<UserEventEnvelope, 'version'> & {
  version?: ProtocolVersion;
};

export function createUserEventEnvelope(
  input: UserEventEnvelopeInput,
): UserEventEnvelope {
  return userEventEnvelopeSchema.parse({
    ...input,
    version: input.version ?? PROTOCOL_VERSION,
  });
}

export type ClientHelloInput = Omit<ClientHelloMessage, 'type' | 'version'> & {
  version?: ProtocolVersion;
};

export function createClientHello(input: ClientHelloInput): ClientHelloMessage {
  return clientHelloMessageSchema.parse({
    type: 'client.hello',
    version: input.version ?? PROTOCOL_VERSION,
    last_ack_cursor: input.last_ack_cursor,
  });
}

export type ServerSyncRequiredInput = Omit<
  ServerSyncRequiredMessage,
  'type' | 'version'
> & {
  version?: ProtocolVersion;
};

export function createServerSyncRequired(
  input: ServerSyncRequiredInput,
): ServerSyncRequiredMessage {
  return serverSyncRequiredMessageSchema.parse({
    type: 'server.sync.required',
    version: input.version ?? PROTOCOL_VERSION,
    required_after_cursor: input.required_after_cursor,
  });
}

export type LiveEventNotifyInput = Omit<
  LiveEventNotifyMessage,
  'type' | 'version'
> & {
  version?: ProtocolVersion;
};

export function createLiveEventNotify(
  input: LiveEventNotifyInput,
): LiveEventNotifyMessage {
  return liveEventNotifyMessageSchema.parse({
    type: 'event.notify',
    version: input.version ?? PROTOCOL_VERSION,
    event: input.event,
  });
}

export type SyncRequestInput = Omit<SyncRequestDto, 'version'> & {
  version?: ProtocolVersion;
};

export function createSyncRequestDto(input: SyncRequestInput): SyncRequestDto {
  return syncRequestDtoSchema.parse({
    ...input,
    version: input.version ?? PROTOCOL_VERSION,
  });
}

export type SyncResponseInput = Omit<SyncResponseDto, 'version'> & {
  version?: ProtocolVersion;
};

export function createSyncResponseDto(
  input: SyncResponseInput,
): SyncResponseDto {
  return syncResponseDtoSchema.parse({
    ...input,
    version: input.version ?? PROTOCOL_VERSION,
  });
}

export type AckRequestInput = Omit<AckRequestDto, 'version'> & {
  version?: ProtocolVersion;
};

export function createAckRequestDto(input: AckRequestInput): AckRequestDto {
  return ackRequestDtoSchema.parse({
    ...input,
    version: input.version ?? PROTOCOL_VERSION,
  });
}
