# ADR-0010: MLS WASM via a hidden WebView bridge on mobile

- Status: Accepted
- Date: 2026-06-21
- Deciders: Platform team
- Technical area: mobile, security
- Supersedes: n/a

## Context

ADR-0008 scoped `packages/mls`'s wasm-pack build to `--target nodejs`, deferring "a browser/RN-targeted wasm-pack build" as follow-up. Connecting `apps/mobile` to the real backend now requires running that same OpenMLS-via-WASM core on-device for real E2EE.

React Native's default JS engine (Hermes, used under Expo's `newArchEnabled` config) has no `WebAssembly` global at all — this is a missing engine capability, not a module-loading problem. The alternative engine, JSC, does implement `WebAssembly`, but swapping engines under the new architecture is unproven and risky, and the existing `--target nodejs` build (`require('fs')`-based sync loader) wouldn't load there regardless of engine.

Both platforms' native WebView component, however, is a full browser engine regardless of the RN app's own JS engine: iOS uses WKWebView (WebKit/JavaScriptCore), Android uses the system WebView (Chromium/V8). Both have complete, standard `WebAssembly` support.

## Decision

Run the OpenMLS wasm core inside a hidden `react-native-webview` instance, bridged to the RN JS thread over `postMessage`. Concretely:

- `packages/mls` gains a second wasm-pack build target, `--target web` (`bun run build:wasm:web`), alongside the existing `--target nodejs` build (still used by Bun/server/tests — untouched).
- A generator script (`packages/mls/scripts/build-webview-bundle.ts`) inlines that web-target build's `.wasm` (as base64) and its JS glue, plus a small RPC harness, into one self-contained HTML string (no `fetch`/server needed — `wasm-bindgen`'s loader accepts a `BufferSource` directly), exported as `@repo/mls/webview`'s `MLS_WEBVIEW_HTML`.
- `apps/mobile` mounts that HTML in a hidden `WebView` and exposes the same `MlsParty` call surface (`generateKeyPackage`, `createGroup`, `addMember`, `joinFromWelcome`, `encrypt`, `decrypt`) as async RPCs over `postMessage`, correlated by request id.

This reuses the exact same audited Rust/OpenMLS core already proven in `crates/mls-wasm`/`packages/mls/src/test/party.test.ts` — no crypto logic is reimplemented in JS or TypeScript.

## Consequences

- Positive: real on-device E2EE on mobile without touching the audited crypto core; works identically on iOS and Android since both ship a real browser engine as their WebView regardless of the app's own JS engine.
- Negative: an extra async hop (postMessage round-trip) per crypto call versus an in-process call; the WebView keeps the wasm party's state only while mounted — an app kill loses in-memory MLS state, same pre-existing limitation as ADR-0008 (no persistent storage provider yet), now also visible on mobile.
- Neutral: `packages/mls`'s build now produces two wasm artifacts (`src/wasm` for Node/Bun, `src/wasm-web` for the WebView bundle) from the same Rust crate.

## Options considered

1. **WebView bridge (chosen).** Real crypto, no engine swap, no native build pipeline. Adds one IPC hop.
2. **Native module via Rust FFI (uniffi-rs).** No IPC hop, no WebView overhead — the correct long-term architecture, but a multi-week effort (toolchain, Swift/Kotlin glue, build pipeline integration). Deferred as future follow-up.
3. **Swap RN's JS engine to JSC.** No WebView needed since JSC has real `WebAssembly`. Rejected for this round: JSC support under RN's new architecture (`newArchEnabled: true`, already set in `apps/mobile/app.json`) is comparatively untested, and the existing `--target nodejs` loader still wouldn't work there — would also need the `--target web` build, at which point the WebView path is the smaller, better-trodden change.

## Rollout

1. `packages/mls/package.json`: `build:wasm:web` + `build:webview` scripts; `build` now produces both wasm targets; new `./webview` export subpath.
2. `packages/mls/scripts/build-webview-bundle.ts`: generator, verified with a functional round-trip (two parties, key package → group → welcome → encrypt → decrypt) run against the generated bundle outside a real WebView (Node + a minimal `window`/`postMessage` shim) as a build-time smoke test.
3. `apps/mobile`: hidden-`WebView`-backed bridge context exposing the `MlsParty` surface asynchronously.
4. Follow-up ticket: native Rust FFI module (option 2) as the long-term replacement; persistent MLS storage provider (tracked already in ADR-0008's follow-up).

## References

- `crates/mls-wasm/src/lib.rs`
- `packages/mls/scripts/build-webview-bundle.ts`
- `docs/adr/0008-openmls-via-wasm-vertical-slice.md`
