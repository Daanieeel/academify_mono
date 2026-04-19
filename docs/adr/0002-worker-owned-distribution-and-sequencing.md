# ADR-0002: Worker-Owned Distribution and Sequencing

- Status: Accepted
- Date: 2026-04-19
- Deciders: Platform team
- Technical area: worker
- Supersedes: n/a

## Context

Message distribution requires recipient resolution, ordering, idempotency, and retries. Keeping this in request/WS gateways increases latency variance and duplicates logic across entry points.

## Decision

All distribution and sequence assignment are owned by worker pipelines. Gateway services enqueue intents only and do not perform heavy fan-out.

## Consequences

- Positive: Single source of truth for sequencing, consistent retry behavior, thinner gateways.
- Negative: More worker observability requirements and queue dependency.
- Neutral: Requires strict job contracts between gateway and worker.

## Options considered

1. Gateway fan-out with worker fallback.
2. Worker-only distribution and sequencing.
3. DB trigger-based sequencing.

## Rollout

1. Define intent job schemas in shared protocol package.
2. Assign sequence/cursor values in worker transaction boundaries.
3. Publish sync notifications after durable writes.
4. Add dead-letter and replay operational runbooks.

## References

- [README.md](../../README.md)
- Ticket 0.2
