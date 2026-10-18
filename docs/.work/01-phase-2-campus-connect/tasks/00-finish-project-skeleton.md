# 00: Finish the project skeleton

**What to build:** Finish the existing Campus Connect starter project so feature work begins from a reproducible, release-green baseline. Repair current failures, isolate automated tests from developer data, make time-dependent behavior deterministic, and provide one quality command shared by local and CI checks.

**Blocked by:** None (can start immediately).

**Status:** completed

## Acceptance criteria

- [x] The existing database initialization test completes reliably without the current import timeout.
- [x] Automated tests create disposable SQLite databases and never read or mutate the developer database.
- [x] Tests can set a deterministic application clock without changing the host clock.
- [x] One documented quality command runs formatting, linting, Svelte and TypeScript checks, the current automated tests, and the production build.
- [x] GitHub Actions uses the quality command and completes successfully from a clean checkout.
- [x] Production builds and server imports preserve lazy database and authentication initialization and do not require the Railway volume.
- [x] This ticket adds no Campus Connect domain tables, domain fixtures, or domain seed data.

## Implementation tasks

- [x] Repair the database initialization timeout and current formatting failures.
- [x] Add reusable disposable-database and deterministic-clock test support without adding domain-specific records.
- [x] Add and document the quality command, then use it in GitHub Actions.
- [x] Replace or repair starter tests only where necessary to make the baseline deterministic and green.
- [x] Run the quality command from a clean local state and retain its successful output for review.

## Comments

- 2026-08-31: `bun run quality` passed from clean commit `b0a2d5a`. It completed formatting and lint checks, Svelte and TypeScript checks, five Vitest tests, one Playwright test, and the production build. The GitHub Actions workflow runs this same command after installing dependencies and Chromium.
- 2026-08-31: A separate production build passed with `DATABASE_URL` pointing to an unavailable path, confirming that build-time imports do not require the Railway volume.
