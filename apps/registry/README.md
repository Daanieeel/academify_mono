# Registry Service

This is the central public registry for Academi.fy.

## API Naming Conventions

For consistency across the entire codebase (including mobile apps and other services), we strictly enforce the following naming schemes when fetching data or communicating with backend services:

- `registryClient` (or just `registry`): Used for the public registry and all communication revolving around the Academi.fy service itself.
- `api` (or `apiClient`): Used for the institution-specific backend APIs (which could be hosted with us or self-hosted by them).
