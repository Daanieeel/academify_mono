# ADR-0006: Report-Escrow Compliance Model

- Status: Accepted
- Date: 2026-06-20
- Deciders: Platform team
- Technical area: security
- Supersedes: n/a

## Context

ADR-0004 established `institutional_auditing_mode` naming and policy boundaries for compliance access, but left open how a reported message becomes readable to an admin/Klassenlehrer without weakening MLS end-to-end encryption for everyone else. A general institutional decryption key escrowed into every MLS group (a group-level backdoor) would let an authorized party read any message in any group at any time — a far larger blast radius than the product needs, and a much bigger attack/abuse surface.

## Decision

Use report-escrow: only the reporter's client — which already holds the plaintext as a group member — re-encrypts the reported message (plus minimal context) to the institution's compliance public key and submits the resulting ciphertext via `POST /reports`. The server stores ciphertext only (`report_packages.encrypted_package`); the compliance private key never touches the database. Decryption requires dual authorization (admin + the reporter's Klassenlehrer, derived from `classes.head_teacher_user_id`), is time-bounded, and produces an immutable `audit_log` entry. No institution-wide group join/escrow key exists. `institutional_auditing_mode` (broader, policy-gated access beyond single reports) remains a separate, deferred mechanism per ADR-0004 and is not implemented in the MVP.

## Consequences

- Positive: only reported messages are ever exposed to compliance roles; E2EE integrity holds for all non-reported traffic; blast radius of a compromised compliance key is limited to what's been explicitly reported.
- Negative: compliance cannot retroactively investigate unreported messages without the (deferred, heavier) institutional auditing mode; reporter's client must be online/functional at report time to perform the seal.
- Neutral: requires an asymmetric seal/open primitive in `@repo/crypto` distinct from the existing symmetric AES-256-GCM helpers.

## Options considered

1. **Report-escrow (chosen)** — reporter re-encrypts to compliance pubkey; scoped to reported messages only.
2. Institution-wide MLS group escrow — admin key can decrypt any group message; rejected as disproportionate blast radius for the MVP.
3. Plaintext reports stored server-side — rejected, violates encrypted-PII-at-rest posture.

## Rollout

1. `packages/crypto`: add `generateComplianceKeyPair`, `sealToPublicKey`, `openWithPrivateKey` (X25519 + HKDF + AES-256-GCM).
2. `packages/database`: `compliance_keys` (public key + version only), `reports`, `report_packages`, `audit_log` (hash-chained).
3. `apps/api-gateway`: `POST /reports`, `POST /reports/:id/review` (dual-auth gated, writes audit entry).

## References

- ADR-0004 (institutional auditing mode naming/policy — unchanged, referenced)
- `packages/crypto/index.ts`
