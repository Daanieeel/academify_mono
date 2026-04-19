# @repo/sync-protocol

Shared sync contracts for the Academify platform.

## Table of contents

1. [Why this package exists](#why-this-package-exists)
2. [How we use it in program flow](#how-we-use-it-in-program-flow)
3. [What is included](#what-is-included)
4. [Schema and directive reference](#schema-and-directive-reference)
    1. [Core schemas](#core-schemas)
    2. [Event and transport schemas](#event-and-transport-schemas)
    3. [REST DTO schemas](#rest-dto-schemas)
    4. [Runtime directives (builders)](#runtime-directives-builders)
    5. [Runtime directives (parsers)](#runtime-directives-parsers)
    6. [Runtime directives (guards)](#runtime-directives-guards)
5. [Quick usage](#quick-usage)
6. [Validate payloads with schemas](#validate-payloads-with-schemas)
7. [Build protocol-safe objects](#build-protocol-safe-objects)
8. [Parse incoming API payloads](#parse-incoming-api-payloads)
9. [Local checks](#local-checks)
10. [Common use cases](#common-use-cases)
    1. [1) Handle incoming WS payload in API gateway](#1-handle-incoming-ws-payload-in-api-gateway)
    2. [2) Parse and validate `/sync` request body](#2-parse-and-validate-sync-request-body)
    3. [3) Build event + notify message in worker](#3-build-event--notify-message-in-worker)
    4. [4) Defensive branch with guard before processing](#4-defensive-branch-with-guard-before-processing)

## Why this package exists

- Defines one canonical sync contract shared by gateway, worker, web, and mobile.
- Prevents schema drift by centralizing event, WS, and REST DTO definitions in one place.
- Provides both compile-time types and runtime validation/parsing for untrusted payloads.

## How we use it in program flow

- Producer services build protocol-safe payloads (builders) before publish/send.
- Transport boundaries (HTTP/WS) parse and validate incoming payloads (parsers/schemas).
- Consumers apply type guards for safe branching on `unknown` data at runtime.
- All participants rely on the same versioned contract (`PROTOCOL_VERSION`).

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

## Schema and directive reference

### Core schemas

- `PROTOCOL_VERSION`: canonical protocol version used by all payloads.
- `protocolVersionSchema`: validates `version` against `PROTOCOL_VERSION`.
- `cursorSchema`: validates monotonic cursor as numeric string.
- `eventTypeSchema`: validates all supported event type literals.
- `payloadMetadataSchema`: validates payload encryption/metadata envelope.

### Event and transport schemas

- `userEventEnvelopeSchema`: canonical user event envelope contract.
- `clientHelloMessageSchema`: WS client hello payload.
- `serverSyncRequiredMessageSchema`: WS sync-required signal payload.
- `liveEventNotifyMessageSchema`: WS live event notification payload.
- `wsMessageSchema`: discriminated union of all WS message payloads.

### REST DTO schemas

- `syncRequestDtoSchema`: validates `/sync` request payload.
- `syncResponseDtoSchema`: validates `/sync` response payload.
- `ackRequestDtoSchema`: validates `/ack` request payload.
- `ackResponseDtoSchema`: validates `/ack` response payload.

### Runtime directives (builders)

- `createUserEventEnvelope`: creates validated event envelope with default version.
- `createClientHello`: creates validated `client.hello` WS message.
- `createServerSyncRequired`: creates validated `server.sync.required` WS message.
- `createLiveEventNotify`: creates validated `event.notify` WS message.
- `createSyncRequestDto`: creates validated `/sync` request DTO.
- `createSyncResponseDto`: creates validated `/sync` response DTO.
- `createAckRequestDto`: creates validated `/ack` request DTO.

### Runtime directives (parsers)

- `parseUserEventEnvelope`: parses unknown input into `UserEventEnvelope`.
- `parseWsMessage`: parses unknown input into `WsMessage` union.
- `parseSyncRequestDto`: parses unknown input into `/sync` request DTO.
- `parseSyncResponseDto`: parses unknown input into `/sync` response DTO.
- `parseAckRequestDto`: parses unknown input into `/ack` request DTO.

### Runtime directives (guards)

- `isUserEventEnvelope`: runtime type guard for `UserEventEnvelope`.
- `isWsMessage`: runtime type guard for `WsMessage`.
- `isSyncRequestDto`: runtime type guard for `/sync` request payload.
- `isAckRequestDto`: runtime type guard for `/ack` request payload.

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

## Common use cases

### 1) Handle incoming WS payload in API gateway

```ts
import { parseWsMessage } from "@repo/sync-protocol";

function onWsMessage(raw: unknown) {
  const message = parseWsMessage(raw);

  switch (message.type) {
    case "client.hello": {
      // bootstrap connection state
      return { lastAckCursor: message.last_ack_cursor };
    }
    case "event.notify": {
      // message.event is already schema-validated
      return { eventId: message.event.event_id };
    }
    case "server.sync.required": {
      return { afterCursor: message.required_after_cursor };
    }
  }
}
```

### 2) Parse and validate `/sync` request body

```ts
import { parseSyncRequestDto } from "@repo/sync-protocol";

function handleSync(body: unknown) {
  const dto = parseSyncRequestDto(body);

  return {
    afterCursor: dto.after_cursor ?? "0",
    limit: dto.limit,
  };
}
```

### 3) Build event + notify message in worker

```ts
import { createLiveEventNotify, createUserEventEnvelope } from "@repo/sync-protocol";

const event = createUserEventEnvelope({
  event_id: crypto.randomUUID(),
  user_id: "user_42",
  cursor: "501",
  event_type: "message.created",
  entity_id: "msg_9001",
  created_at: new Date().toISOString(),
  payload_metadata: {
    encryption: "mls",
    content_type: "application/json",
  },
});

const wsNotify = createLiveEventNotify({ event });
```

### 4) Defensive branch with guard before processing

```ts
import { isUserEventEnvelope } from "@repo/sync-protocol";

function handleQueuePayload(payload: unknown) {
  if (!isUserEventEnvelope(payload)) {
    throw new Error("Invalid queue payload");
  }

  // payload is now narrowed to UserEventEnvelope
  return `${payload.event_type}:${payload.entity_id}`;
}
```
