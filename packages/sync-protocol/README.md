# @repo/sync-protocol

Shared sync contracts for the Academify platform.

This package provides:

- Zod schemas + inferred TypeScript types
- Runtime builders for creating valid protocol payloads
- Runtime parsers for decoding untrusted input
- Type guards for narrowing `unknown` data safely

## What is included

- Protocol version contract (`PROTOCOL_VERSION`)
- User event envelope schema (`userEventEnvelopeSchema`)
- WebSocket message schemas (`client.hello`, `server.sync.required`, `event.notify`)
- REST DTO schemas for `/sync` and `/ack`

## Quick usage

```ts
import {
  PROTOCOL_VERSION,
  createClientHello,
  parseWsMessage,
  isWsMessage,
} from "@repo/sync-protocol";

const hello = createClientHello({ last_ack_cursor: "0" });
// => { version: '1.0.0', type: 'client.hello', last_ack_cursor: '0' }

const parsed = parseWsMessage(hello);
if (isWsMessage(parsed)) {
  console.log(parsed.type);
}

console.log(PROTOCOL_VERSION); // '1.0.0'
```

## Validate payloads with schemas

```ts
import { userEventEnvelopeSchema } from "@repo/sync-protocol";

const result = userEventEnvelopeSchema.safeParse({
  version: "1.0.0",
  event_id: "550e8400-e29b-41d4-a716-446655440000",
  user_id: "user_123",
  cursor: "42",
  event_type: "message.created",
  entity_id: "chat_abc",
  created_at: "2026-04-19T10:15:30.000Z",
  payload_metadata: {
    encryption: "mls",
    content_type: "application/json",
  },
});

if (!result.success) {
  console.error(result.error.flatten());
}
```

## Build protocol-safe objects

```ts
import { createUserEventEnvelope, createLiveEventNotify } from "@repo/sync-protocol";

const event = createUserEventEnvelope({
  event_id: "550e8400-e29b-41d4-a716-446655440000",
  user_id: "user_123",
  cursor: "101",
  event_type: "profile.updated",
  entity_id: "profile_123",
  created_at: "2026-04-19T10:15:30.000Z",
  payload_metadata: {
    encryption: "envelope",
    content_type: "application/json",
  },
});

const notify = createLiveEventNotify({ event });
```

## Parse incoming API payloads

```ts
import { parseSyncRequestDto, parseAckRequestDto } from "@repo/sync-protocol";

const syncRequest = parseSyncRequestDto({
  version: "1.0.0",
  after_cursor: "120",
  limit: 100,
});

const ackRequest = parseAckRequestDto({
  version: "1.0.0",
  last_ack_cursor: "120",
});
```

## Local checks

```bash
bun test
bun run typecheck
```
