# Contributing

## Development Baseline

- Use Bun commands in this repository (`bun install`, `bun run <script>`, `bun test`).
- Keep changes scoped to one concern per pull request.
- Architectural changes that affect behavior or ownership boundaries must include an ADR in `docs/adr`.

## Commit Style

- Follow Conventional Commits.
- Format: `type(scope): summary`.
- Allowed types: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
- Keep the summary imperative and under 72 characters.
- Reference ticket IDs in the body when available.

Example:

```text
feat(sync): add reconnect cursor validation

Implements ticket 0.2.
```

## Testing Minimums

- Every code change must include one of:
  - New or updated automated test coverage.
  - A documented justification in the PR body when tests are not feasible.

- At minimum before opening a PR:
  - `bun run format:check`
  - `bun run lint`
  - `bun run typecheck`
  - `bun test` (or package-level tests when scoped)

- Bug fixes must include a regression test where practical.

## Definition Of Done

- Code compiles and typechecks for affected packages.
- Ox formatting and linting pass.
- Tests pass for affected packages.
- Public API, schema, or behavior changes are documented.
- ADR added/updated when architectural decisions changed.
- Reviewer feedback resolved and CI green.

## Pull Request Expectations

- Include a short problem statement and solution summary.
- List risks and rollout notes for behavior changes.
- Add screenshots or recordings for UI updates.
- Mention migration steps for schema or config changes.
