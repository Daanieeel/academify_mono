import { describe, expect, it } from 'bun:test';

import {
  PROTOCOL_VERSION,
  ackRequestDtoSchema,
  createClientHello,
  createUserEventEnvelope,
  clientHelloMessageSchema,
  eventTypeSchema,
  isWsMessage,
  liveEventNotifyMessageSchema,
  parseWsMessage,
  serverSyncRequiredMessageSchema,
  syncRequestDtoSchema,
  userEventEnvelopeSchema,
} from '../index';

describe('userEventEnvelopeSchema', () => {
  const validEnvelope = {
    version: PROTOCOL_VERSION,
    event_id: '550e8400-e29b-41d4-a716-446655440000',
    user_id: 'user_123',
    cursor: '42',
    event_type: 'message.created',
    entity_id: 'chat_abc',
    created_at: '2026-04-19T10:15:30.000Z',
    payload_metadata: {
      encryption: 'mls',
      key_version: 2,
      content_type: 'application/json',
      size_bytes: 128,
      payload_ref: 'blob://message/550e8400-e29b-41d4-a716-446655440000',
      schema_version: '1',
    },
  } as const;

  it('accepts a valid event envelope payload', () => {
    const result = userEventEnvelopeSchema.safeParse(validEnvelope);

    expect(result.success).toBe(true);
  });

  it('rejects envelope payload with invalid event_type', () => {
    const invalidPayload = {
      ...validEnvelope,
      event_type: 'message.archived',
    };

    const result = userEventEnvelopeSchema.safeParse(invalidPayload);

    expect(result.success).toBe(false);
  });

  it('rejects envelope payload with non-numeric cursor string', () => {
    const invalidPayload = {
      ...validEnvelope,
      cursor: '4a2',
    };

    const result = userEventEnvelopeSchema.safeParse(invalidPayload);

    expect(result.success).toBe(false);
  });

  it('rejects envelope payload with missing protocol version', () => {
    const invalidPayload = {
      ...validEnvelope,
      version: '0.9.0',
    };

    const result = userEventEnvelopeSchema.safeParse(invalidPayload);

    expect(result.success).toBe(false);
  });
});

describe('eventTypeSchema', () => {
  it('accepts all canonical event types', () => {
    const validEventTypes = [
      'message.created',
      'message.edited',
      'message.deleted',
      'chat.updated',
      'membership.added',
      'membership.removed',
      'profile.updated',
      'blackboard.created',
      'blackboard.updated',
      'event.created',
      'event.updated',
      'event.cancelled',
      'club.updated',
      'join_request.updated',
    ];

    for (const eventType of validEventTypes) {
      expect(eventTypeSchema.safeParse(eventType).success).toBe(true);
    }
  });
});

describe('ws schemas', () => {
  it('accepts client hello payload', () => {
    const payload = {
      version: PROTOCOL_VERSION,
      type: 'client.hello',
      last_ack_cursor: '0',
    };

    expect(clientHelloMessageSchema.safeParse(payload).success).toBe(true);
  });

  it('accepts sync required payload', () => {
    const payload = {
      version: PROTOCOL_VERSION,
      type: 'server.sync.required',
      required_after_cursor: '10',
    };

    expect(serverSyncRequiredMessageSchema.safeParse(payload).success).toBe(
      true,
    );
  });

  it('accepts event notify payload', () => {
    const payload = {
      version: PROTOCOL_VERSION,
      type: 'event.notify',
      event: {
        version: PROTOCOL_VERSION,
        event_id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: 'user_123',
        cursor: '99',
        event_type: 'profile.updated',
        entity_id: 'profile_123',
        created_at: '2026-04-19T10:15:30.000Z',
        payload_metadata: {
          encryption: 'envelope',
          content_type: 'application/json',
        },
      },
    };

    expect(liveEventNotifyMessageSchema.safeParse(payload).success).toBe(true);
  });

  it('rejects client hello payload with invalid cursor', () => {
    const payload = {
      version: PROTOCOL_VERSION,
      type: 'client.hello',
      last_ack_cursor: '-1',
    };

    expect(clientHelloMessageSchema.safeParse(payload).success).toBe(false);
  });
});

describe('REST DTO schemas', () => {
  it('accepts /sync request payload and applies default limit', () => {
    const payload = {
      version: PROTOCOL_VERSION,
      after_cursor: '120',
    };

    const parsed = syncRequestDtoSchema.parse(payload);

    expect(parsed.limit).toBe(100);
  });

  it('rejects /sync request payload with out-of-range limit', () => {
    const payload = {
      version: PROTOCOL_VERSION,
      after_cursor: '120',
      limit: 1000,
    };

    expect(syncRequestDtoSchema.safeParse(payload).success).toBe(false);
  });

  it('accepts /ack request payload', () => {
    const payload = {
      version: PROTOCOL_VERSION,
      last_ack_cursor: '120',
    };

    expect(ackRequestDtoSchema.safeParse(payload).success).toBe(true);
  });

  it('rejects /ack request payload with missing last_ack_cursor', () => {
    const payload = {
      version: PROTOCOL_VERSION,
    };

    expect(ackRequestDtoSchema.safeParse(payload).success).toBe(false);
  });
});

describe('runtime API', () => {
  it('builds client hello with protocol default', () => {
    const message = createClientHello({ last_ack_cursor: '5' });

    expect(message.version).toBe(PROTOCOL_VERSION);
    expect(message.type).toBe('client.hello');
  });

  it('builds and validates event envelope via helper', () => {
    const envelope = createUserEventEnvelope({
      event_id: '550e8400-e29b-41d4-a716-446655440000',
      user_id: 'user_123',
      cursor: '42',
      event_type: 'message.created',
      entity_id: 'chat_abc',
      created_at: '2026-04-19T10:15:30.000Z',
      payload_metadata: {
        encryption: 'mls',
        content_type: 'application/json',
      },
    });

    expect(userEventEnvelopeSchema.safeParse(envelope).success).toBe(true);
  });

  it('parses ws message and narrows by guard', () => {
    const parsed = parseWsMessage({
      version: PROTOCOL_VERSION,
      type: 'client.hello',
      last_ack_cursor: '0',
    });

    expect(parsed.type).toBe('client.hello');
    expect(isWsMessage(parsed)).toBe(true);
    expect(isWsMessage({ type: 'unknown' })).toBe(false);
  });
});
