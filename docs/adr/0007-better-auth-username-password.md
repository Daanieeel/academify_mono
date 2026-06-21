# ADR-0007: better-auth, Username + Password Only, Admin-Provisioned Accounts

- Status: Accepted
- Date: 2026-06-20
- Deciders: Platform team
- Technical area: security
- Supersedes: n/a

## Context

Academify's users are primarily minors (students) in an institutional setting. Self-service signup with email verification doesn't fit: students often lack independent email addresses, and the institution — not the individual — is the source of truth for who is allowed to have an account. The product needs a simple, low-friction credential (username + password) and an account lifecycle controlled entirely by the institution (admin/teacher), not by the end user.

## Decision

Use better-auth as the auth library, with only the username+password plugin enabled. `emailAndPassword` sign-in is disabled and self-service `signUp` is disabled at the API surface. Accounts are created exclusively through admin-provisioned paths: bulk CSV import of student names (admin dashboard) or invite links (`POST /admin/invites`, `POST /invites/:token/redeem`). better-auth's core schema still carries an `email` field (structural, not exposed); provisioning paths populate it as a placeholder where students have no real address. better-auth's official Drizzle adapter is used against `@repo/database` so auth tables live in the same migration history as the rest of the schema.

## Consequences

- Positive: no email infrastructure dependency for login; account creation is fully institution-controlled, matching the real-world enrollment process; better-auth's adapter/plugin model avoids hand-rolled session/credential code.
- Negative: CSV import and invite-link UI/parsing are deferred past the MVP (schema + endpoint stubs only); placeholder emails are a minor schema wart inherited from better-auth's core model.
- Neutral: replaces the placeholder `createSessionId`/`parseSessionPayload` helpers that previously stood in for real auth.

## Options considered

1. **better-auth, username+password, admin-provisioned (chosen)**.
2. Email/password self-signup — rejected, doesn't fit minors-without-email + institution-controlled enrollment.
3. Hand-rolled session/credential layer — rejected, reinvents what better-auth's adapter/plugin model already solves correctly.

## Rollout

1. `packages/auth`: `betterAuth()` instance wired to the `username` plugin, `drizzleAdapter` over `@repo/database`, `emailAndPassword.enabled: false`.
2. `packages/database/src/schema/auth.ts`: generated via `better-auth` CLI (`user`, `session`, `account`, `verification`).
3. `apps/api-gateway`: mounts the better-auth handler + session middleware (Phase 6); provisioning endpoints (`/admin/invites`, `/invites/:token/redeem`, `/admin/import`) stubbed, UI deferred.

## References

- `packages/auth/index.ts`
- `packages/database/src/schema/auth.ts`
