# ADR-0001: Notify Over WS, Fetch Over REST Sync Model

- Status: Accepted
- Date: 2026-04-19
- Deciders: Platform team
- Technical area: api
- Supersedes: n/a

## Context

The platform must support scalable real-time messaging with reconnect and catch-up semantics across web and mobile clients. Pushing full payload fan-out over WebSocket increases gateway pressure, complicates replay, and makes backfill behavior harder to reason about.

## Decision

Use WebSocket for lightweight event notifications and cursor hints only. Clients fetch authoritative payloads through REST sync endpoints using per-user cursors.

## Consequences

- Positive: Better horizontal scaling, simpler replay semantics, stable API contracts for offline and reconnect.
- Negative: Extra client round-trip after notification.
- Neutral: Requires consistent cursor management and idempotent fetch/ack behavior.

## Options considered

1. Push full payloads over WS only.
2. Polling-only REST sync.
3. Notify over WS, fetch over REST.

## Rollout

1. Standardize event envelope (`event_type`, `cursor`, `entity_id`).
2. Implement `/sync?after_cursor=` contract and ack endpoint.
3. Treat WS events as hints; reconcile through REST.
4. Add metrics for sync lag and reconnect recovery time.

## References

- [README.md](../../README.md)
- Ticket 0.2
