# Personal Event authoring local verification

Date: 2026-10-10, Europe/Budapest

Scope: [ticket 08](../../../.work/phase-2-campus-connect/tasks/08-publish-public-personal-events.md). These checks use disposable SQLite databases and an isolated preview of the built application. They are local implementation evidence. Final Railway checks and captures remain planned.

## Automated evidence

- [Application tests](../../../../src/lib/server/application/event-authoring.spec.ts) cover immediate public publication, author management, every exposed field, title and description boundaries, normalized and deduplicated Tag choices, capacity rules, authentication, author authorization, immutable host, fixed public visibility, curated and manual Locations, stored coordinates, read-only history, and idempotent catalog seeding. Berlin time cases cover summer, winter, invalid calendar dates, skipped and repeated clock times, clock-change transitions, and overnight schedules.
- [Browser tests](../../../../src/routes/event-authoring.e2e.ts) cover the personal publication journey, visitor discovery, My events, persisted editing, protected return paths, empty state, validation recovery, request failures, pending submissions, and layouts at 360x800, 768x1024, and 1440x900. Axe scans cover Create, edit, and populated My events at phone and desktop widths.
- [Existing discovery tests](../../../../src/lib/server/application/events.spec.ts) verify the public Event contract with Location coordinates available through the detail read operation.
- [Seed tests](../../../../src/lib/server/seed.spec.ts) continue to verify stable identifiers and idempotent content seeding. The authoring catalog can also be seeded independently of demonstration Events and Users.

## Check results

`bun run quality` passed. Formatting and ESLint passed. Svelte and TypeScript checks passed with zero errors and warnings. All 121 unit and integration tests and all 48 browser tests passed. The production build passed.

The authoring tests include 38 application cases and seven browser cases. Axe found no critical or serious violations on Create, edit, or populated My events at phone and desktop widths after correcting the shared avatar fallback contrast. Local Create screenshots were visually checked at 360px and 1440px widths.

The test preview now binds to `127.0.0.1`, matching its browser base URL and authentication origin. This corrected registration navigation timeouts with the prior localhost configuration. One existing Unicode Group case submitted an empty description during the first full browser run. It passed unchanged in both the focused rerun and the final full run.

The final Standards and Spec reviews found no outstanding findings. The optional duplicated Location-write finding was resolved with a shared helper.

## Planned Railway evidence

On the final deployed commit, publish a personal Event with a curated campus Location, confirm its public Discover entry and detail page, find it in My events, and edit its supported fields. Repeat the Location path with a manual label and confirm that it has no map marker. Verify another User cannot open the edit form. Check the phone navigation and form.

Capture clean and annotated Event publication screenshots for CAP-05 and the personal publication and My events screencast scenes. Record the deployed commit and capture date with the final media. Local test screenshots are visual checks, not final submission captures. Participation-dependent locks and cancellation remain in ticket 13; group authoring remains in ticket 09 and maps in ticket 14.
