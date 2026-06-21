# ADR-0008: OpenMLS via WASM, Vertical Slice First

- Status: Accepted
- Date: 2026-06-20
- Deciders: Platform team
- Technical area: security
- Supersedes: n/a

## Context

`packages/mls` previously held only type contracts (`GroupId`, `MlsEpoch`, `MlsMember`, `MlsGroupState`, `MlsCommitMessage`) with no real MLS implementation or library. The MVP needs genuine E2EE, not a stub. OpenMLS (Rust, RFC 9420) compiled to WASM keeps the cryptographic core in one audited implementation shared across server (Delivery Service only — never holds private keys), web, and eventually mobile, rather than re-implementing MLS in TypeScript. The full surface (add/remove members, persistent storage provider tied to the `mls_*` tables in `packages/database`, multi-device key packages) is large enough that building it all before proving the toolchain works end-to-end would be the highest-risk part of the whole MVP.

## Decision

Build `crates/mls-wasm` as a real `openmls` 0.8.1 + `wasm-bindgen` crate compiled to `wasm32-unknown-unknown`, scoped to a vertical slice: exactly two parties, `create_group`, `generate_key_package`, `add_member` (returns a Welcome), `join_from_welcome`, `encrypt`, `decrypt`. No stubbing — this is the real OpenMLS state machine, verified by compiling to actual wasm32 and round-tripping ciphertext between two `MlsParty` instances from Bun (`packages/mls/src/test/party.test.ts`). `packages/mls/index.ts` re-exports the generated binding; `bun run build:wasm` (wraps `wasm-pack build --target nodejs`) regenerates `packages/mls/src/wasm/` (gitignored, like `dist/`) from the crate.

Deferred to a follow-up, not in this slice: `remove_members`, multi-device key packages per user, a persistent `StorageProvider` backed by `packages/database`'s `mls_groups`/`mls_group_members`/`key_packages` tables (currently in-memory via `OpenMlsRustCrypto`'s default storage), the server-side Delivery Service HTTP contracts, and a browser/RN-targeted wasm-pack build (current build targets Node/Bun only).

## Consequences

- Positive: de-risked the single biggest unknown in the MVP early — OpenMLS, wasm-bindgen, and Bun's wasm loading are proven to interoperate, with negative paths (no-group state, tampered ciphertext) verified to fail safely (`AeadError`) rather than panic.
- Negative: not yet usable for real multi-member chats (only 2 parties) or across process restarts (in-memory storage); web/mobile wasm targets still need a separate build pass.
- Neutral: toolchain now requires `rustup` + `wasm-pack` for anyone touching `packages/mls` (documented in package scripts).

## Rollout

1. `crates/mls-wasm/src/lib.rs`: `MlsParty` wasm-bindgen struct wrapping `OpenMlsRustCrypto` + `SignatureKeyPair` + `Option<MlsGroup>`.
2. `packages/mls/package.json`: `build:wasm` script; `build` depends on it.
3. `packages/mls/index.ts`: re-exports `MlsParty`; existing type contracts kept as-is.
4. Follow-up ticket: persistent storage provider + `remove_members` + Delivery Service contracts + browser/RN wasm target.

## References

- `crates/mls-wasm/src/lib.rs`
- `packages/mls/src/test/party.test.ts`
