# Group Event authoring local verification

Date: 2026-10-12, Europe/Budapest

Scope: [ticket 09](../../../.work/phase-2-campus-connect/tasks/09-publish-public-group-events.md). Checks use disposable SQLite databases and an isolated preview of the built application. Final Railway checks and captures remain planned.

## Automated evidence

- [Group application tests](../../../../src/lib/server/application/group-event-authoring.spec.ts) cover seeded owner and representative publication, acting author and Group attribution, public discovery, shared management, immutable host and author during edits, forbidden subscriber and unrelated User roles, unauthenticated rejection, role removal and demotion, authorized host choices, Campus Updates protection, read-only history, shared validation, all response modes, normalized Tags, and curated and plain-text Locations.
- [Personal application tests](../../../../src/lib/server/application/event-authoring.spec.ts) continue to exercise the same authoring operations and shared validation, including field boundaries, Berlin timezone transitions, fixed public visibility, author-only personal management, and catalog seeding.
- [Group browser tests](../../../../src/routes/group-event-authoring.e2e.ts) cover both seeded manager publication journeys, visitor discovery through Discover and Group details, My events, editing by the other manager, visitor redirects, forbidden roles and forged host choices, validation recovery, request failures, pending submission, empty host and Event lists, read-only history, overflow, touch targets, and accessibility at 360x800, 768x1024, and 1440x900.
- [Test account seeding](../../../../src/lib/server/testing/seed-accounts.ts) adds credentials only through the disposable browser runner. Setup repeats the seed before sign-in to verify idempotency. The ordinary demonstration seed does not create password accounts, and the existing Group fixtures supply every authorization role.

## Check results

`bun run quality` passed. Formatting, linting, and ESLint passed. Svelte and TypeScript checks reported zero errors and warnings. All 146 unit and integration tests and all 56 browser tests passed. The production build passed.

Ticket 09 adds 25 application cases and eight browser cases. Axe found no critical or serious violations on Group authoring, My events, validation and request-failure forms, empty states, and forbidden pages at 360px, 768px, and 1440px widths. Phone and desktop Group edit screenshots were visually checked. Validation scans exposed insufficient contrast in the shared light-theme error color on input backgrounds. Darkening the semantic destructive color resolved it.

The first full browser run failed when the existing visitor Follow dialog did not open. All five Follow tests passed unchanged in isolation, and the final full run passed all 56 browser tests. The ordinary dependency build warnings remain unchanged.

### Standards review

No findings. The read-only review checked the tracked diff and new files against the repository rules, domain vocabulary, relevant ADRs, and shadcn-svelte conventions.

### Spec review

No findings. The read-only review checked ticket 09's authorization, author and host persistence, validation, discovery, management, responsive states, tests, and evidence planning. Participation locks and cancellation remain in ticket 13.

## Permission decisions

Group Event publication, management retrieval, edits, and My events use current owner or representative membership. Authorship alone does not preserve management after demotion or membership removal. Personal Events remain author-only. Edits preserve the original acting author and Group host. Campus Updates content stays seed-controlled. No schema migration is needed.

## Planned Railway evidence

On the final deployed commit, sign in as a seeded owner and representative with demonstration credentials stored outside Git. Publish for Film Society with a curated Location, verify the Group host, public Discover entry, and Group detail entry, then find and edit the Event as the other manager. Repeat with a manual Location. Confirm a subscriber and unrelated User cannot publish for the Group or open its edit form. Verify phone and tablet forms and My events.

Capture clean and annotated Event publication screenshots for CAP-05 that show the Group Host choice. Include public Group publication and My events in the final screencast. Record the deployed commit and capture date with final media. Local screenshots are visual verification only. Participation-dependent locks and cancellation remain in ticket 13, and maps remain in ticket 14.
