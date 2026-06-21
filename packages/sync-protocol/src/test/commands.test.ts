import { describe, expect, it } from 'bun:test';

import {
  jobPayloadSchema,
  parseJobPayload,
  presenceMessageSchema,
} from '../index';

describe('jobPayloadSchema', () => {
  it('accepts a SEND_MESSAGE payload', () => {
    const payload = {
      command: 'SEND_MESSAGE',
      message_id: '550e8400-e29b-41d4-a716-446655440000',
      chat_id: 'chat_1',
      sender_user_id: 'user_1',
      sender_device_id: 'device_1',
      mls_epoch: 0,
      ciphertext: 'c29tZS1jaXBoZXJ0ZXh0',
      content_type: 'application/json',
    };

    expect(jobPayloadSchema.safeParse(payload).success).toBe(true);
  });

  it('accepts a MEMBERSHIP_CHANGED payload', () => {
    const payload = {
      command: 'MEMBERSHIP_CHANGED',
      chat_id: 'chat_1',
      user_id: 'user_1',
      action: 'added',
    };

    expect(jobPayloadSchema.safeParse(payload).success).toBe(true);
  });

  it('rejects an unknown command', () => {
    const payload = { command: 'DO_SOMETHING_ELSE' };

    expect(jobPayloadSchema.safeParse(payload).success).toBe(false);
  });

  it('rejects a payload missing required fields for its command', () => {
    const payload = {
      command: 'SEND_MESSAGE',
      message_id: '550e8400-e29b-41d4-a716-446655440000',
      chat_id: 'chat_1',
    };

    expect(jobPayloadSchema.safeParse(payload).success).toBe(false);
  });

  it('parseJobPayload throws on invalid input', () => {
    expect(() => parseJobPayload({ command: 'NOPE' })).toThrow();
  });
});

describe('presenceMessageSchema', () => {
  it('accepts a valid presence payload', () => {
    const payload = {
      userId: 'user_1',
      status: 'online',
      at: '2026-04-19T10:15:30.000Z',
    };

    expect(presenceMessageSchema.safeParse(payload).success).toBe(true);
  });

  it('rejects an invalid status', () => {
    const payload = {
      userId: 'user_1',
      status: 'away',
      at: '2026-04-19T10:15:30.000Z',
    };

    expect(presenceMessageSchema.safeParse(payload).success).toBe(false);
  });
});
