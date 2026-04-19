# ADR-0004: Institutional Auditing Mode Naming and Policy

- Status: Accepted
- Date: 2026-04-19
- Deciders: Platform team
- Technical area: security
- Supersedes: n/a

## Context

Compliance workflows need a clear and non-ambiguous mode name and enforceable policy boundaries. Terminology such as "admin access" is too broad and can imply unrestricted surveillance.

## Decision

Use the explicit term `institutional_auditing_mode` for policy-gated access workflows. This mode requires dual authorization, scoped access, immutable logs, and time-bounded decryption sessions.

## Consequences

- Positive: Clear legal/compliance intent, stronger guardrails, auditable operations.
- Negative: Additional operational workflow overhead for approvals.
- Neutral: Requires policy training for institution operators.

## Options considered

1. Generic admin moderation mode.
2. Institutional auditing mode with strict policy controls.
3. Per-request exception workflow with no named mode.

## Rollout

1. Standardize naming in API schemas and internal docs.
2. Require dual-approval state before key access.
3. Emit immutable audit events for every access action.
4. Enforce session TTL and scoped retrieval constraints.

## References

- [README.md](../../README.md)
- Ticket 0.2
