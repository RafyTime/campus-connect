# ADR 0001: Lazily initialise database and authentication

## Status

Accepted — August 2026.

## Context

Railway mounts the persistent SQLite volume at `/data` only when the service runs. During `bun run build`, SvelteKit evaluates server modules while that volume is unavailable. Eagerly creating the libSQL client or Better Auth instance at module import therefore made production builds fail.

## Decision

Create and cache the database and Better Auth singletons only on their first runtime use. Skip authentication handling while SvelteKit is building.

## Consequences

The application builds without a database volume and uses the real persistent SQLite database for runtime requests. Keep the lazy `getDb()` and `getAuth()` boundaries when changing server code.

For the detailed diagnosis, alternatives, and migration implications, see [Railway, SvelteKit, and SQLite build lifecycle](../research/railway-sveltekit-sqlite-build-lifecycle.md).
