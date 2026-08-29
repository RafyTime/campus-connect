# 00: Finish the project skeleton

**What to build:** Finish the existing Campus Connect starter project so feature work begins from a reproducible, release-green baseline. Repair current failures, isolate automated tests from developer data, make time-dependent behavior deterministic, and provide one release command shared by local and CI checks.

**Blocked by:** None (can start immediately).

**Status:** ready

## Acceptance criteria

- [ ] The existing database initialization test completes reliably without the current import timeout.
- [ ] Automated tests create disposable SQLite databases and never read or mutate the developer database.
- [ ] Tests can set a deterministic application clock without changing the host clock.
- [ ] One documented release command runs formatting, linting, Svelte and TypeScript checks, the current automated tests, and the production build.
- [ ] GitHub Actions uses the release command and completes successfully from a clean checkout.
- [ ] Production builds and server imports preserve lazy database and authentication initialization and do not require the Railway volume.
- [ ] This ticket adds no Campus Connect domain tables, domain fixtures, or domain seed data.

## Implementation tasks

- [ ] Repair the database initialization timeout and current formatting failures.
- [ ] Add reusable disposable-database and deterministic-clock test support without adding domain-specific records.
- [ ] Add and document the release command, then use it in GitHub Actions.
- [ ] Replace or repair starter tests only where necessary to make the baseline deterministic and green.
- [ ] Run the release command from a clean local state and retain its successful output for review.

## Comments
