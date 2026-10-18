# Public Event filtering local verification

Date: 2026-10-12, Europe/Budapest

Scope: [ticket 10](../../../.work/phase-2-campus-connect/tasks/10-filter-public-events.md). Application tests use disposable SQLite databases. Browser tests use the built application with a temporary seeded database and an isolated preview. Railway checks and final captures remain planned.

## Automated evidence

- [Filtering application tests](../../../../src/lib/server/application/event-discovery.spec.ts) cover Tag OR semantics without duplicate results, AND across Tags, date, Group, and host type, conflicting Group and personal-host filters, soonest-start ordering, counts, ongoing Events, ended and cancelled exclusion, unknown and duplicate values, malformed input, empty results, and available filter options. Date cases cover campus midnight and the 23-hour and 25-hour daylight-saving transition days.
- [Filtering browser tests](../../../../src/routes/event-filtering.e2e.ts) cover shared URLs, refresh, visitor and signed-in discovery, Tag selection and removal, keyboard interaction, back and forward navigation, normalized invalid URLs, request loading and focus retention, selections during pending requests, responsive controls, active summaries, counts, clearing, and no-match recovery. The phone, tablet, and desktop cases scan populated and empty filtered Discover states for critical or serious accessibility violations, check overflow, and verify 44px control and Tag-label targets.
- Existing [public discovery tests](../../../../src/lib/server/application/events.spec.ts) and [authoring tests](../../../../src/lib/server/application/event-authoring.spec.ts) retain public-access and publication coverage. The committed schema permits only public visibility. Restricted discovery belongs to ticket 17's separately gated stretch.

The existing seed covers every Tag, Group, and host interaction. Only the disposable application tests add distinct date-boundary records. No migration or demonstration-seed change is needed.

## Check results

Formatting, linting, and ESLint passed. Svelte and TypeScript checks reported zero errors and warnings. All 153 unit and integration tests passed. The complete browser suite passed all 65 tests with `bun run test:e2e --workers=1`.

Ticket 10 adds seven application cases and nine browser cases. Axe found no critical or serious violations on populated or empty filtered Discover at 360x800, 768x1024, and 1440x900. Local phone, tablet, and desktop screenshots were visually checked.

The initial `bun run quality` passed formatting, linting, typechecking, and application tests, but its six-worker browser run failed the existing visitor Follow-dialog and Unicode Group-creation cases. All nine filtering cases passed in that run. The Follow-dialog failure also appears in ticket 09's local record. Captured states showed a missing dialog and an empty Group description despite the test's fill step. The complete one-worker rerun passed without changes to either case. This supports a timing-related explanation but does not establish its cause. Parallel browser reliability remains a quality-audit concern for ticket 15.

`bun run build` passed. The existing dependency and plugin-timing warnings remain. No deployment, production access, or daily-preview change was performed.

### Standards review

The read-only review found no actionable standards violations or code smells. It checked the local diff and new files against repository instructions, the glossary, both ADRs, and installed shadcn-svelte components. Formatting and linting remain separate quality gates.

### Spec review

The read-only review identified keyboard focus loss when the loading shell replaces filter controls. The shell now keeps same-page controls mounted while showing its loading status. The delayed-request browser case checks focus after results arrive. A second finding covered control changes during a pending request, which could overwrite an earlier selection. Each change now uses the pending target URL when available, and a held-request browser case proves both categories survive. No other committed-core gaps or unrequested scope remained after checking the schema's public-only constraint and existing authoring coverage.

## Filter contract

The URL uses repeated `tag` parameters plus single `date`, `group`, and `host` parameters. A date is an Event's start date in Europe/Berlin. Tags combine with OR, and different categories combine with AND. The backend trims identifiers, deduplicates Tags, normalizes host case, and ignores unknown identifiers or invalid calendar dates. The first value wins for repeated single-value categories. Changing a control rebuilds the URL from normalized selections. Clearing returns to `/`.

The server filters the existing public scheduled feed and returns its results, count, normalized selections, and Tag and Group options. Filtering keeps the existing soonest-start order. This uses the small Phase 2 dataset without adding pagination.

## Planned Railway evidence

On the final deployed commit, combine two Tags with a date, Group, and host type. Confirm Tag OR behavior, cross-category AND behavior, result count, and soonest-start order. Refresh and open the shared URL in a visitor session, then repeat signed in. Show an empty result set and recover with Show all Events. Verify keyboard interaction and loading, then repeat filtering at 360x800 and 768x1024.

Capture clean and annotated desktop Discover for CAP-01 and mobile Discover for CAP-02 with active filters and the result count. Include desktop filtering, URL restoration, clearing, and a mobile filtering interaction in the final screencast. Record the deployed commit and capture date with final media. Local Playwright screenshots support layout verification only.
