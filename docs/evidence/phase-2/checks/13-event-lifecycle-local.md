# Ticket 13: Event lifecycle and retained history

Local implementation verification on 2026-10-20, Europe/Berlin. Final Railway verification and submission captures remain planned.

## Delivered behavior

Before Participation exists, permitted Creators can edit all exposed fields except host. Existing interests or registrations lock response mode, start, end and Location. Title, description, Tags and capacity increases remain editable. Capacity decreases after Participation return a specific conflict; confirmed registrations remain covered. Unchanged plain-text Locations retain their stored relationship.

Editing and cancellation use SQLite immediate write transactions, serialized with Participation operations. Cancellation changes status and the Post update timestamp without deleting the Event, Post or Participation. It returns explicit authentication, authorization, missing, cancelled, ended and persistence results. Cancelled Events leave Discover but remain accessible by direct link, My events and My activity. Ended Events become read-only at the end timestamp. No delete, reopen or draft operation is exposed.

Creator forms explain and expose the locks. Cancellation requires a deliberate confirmation, explains retained history and finality, disables repeated requests while pending, and supports retry after request failure. Ended and cancelled management pages expose history without mutation controls. Event details explain cancelled and ended status. Existing activity and creator lists retain their status badges and direct links.

The accumulated seed adds `event-ended-workshop`, authored by Lena with Jonas registered, for ended history. Existing scheduled interests, registrations, nearly full and full Events, cancelled interest and registration history remain available. Seed helpers and fixtures already support these states; no schema migration is required.

## Automated evidence

- `src/lib/server/application/event-lifecycle.spec.ts`: post-interest and post-registration locks; unchanged and changed plain-text Locations; allowed descriptive edits; capacity decreases before Participation, unchanged capacity, increases, and rejected reductions including below confirmed count; final cancellation; authentication and manager authorization; retained direct, creator and participant history; blocked joins and withdrawals; exact-end read-only behavior; cancellation racing with registration; and minute-precision form round trips that preserve seeded seconds, including the final seconds before the stored end.
- `src/lib/server/application/event-authoring.spec.ts`: pre-Participation editing of all exposed fields, host immutability and explicit ended/cancelled edit results.
- `src/lib/server/seed.spec.ts`: idempotent ended Participation history alongside existing seed coverage.
- `src/routes/event-lifecycle.e2e.ts`: Creator publication, Explorer registration, locked form fields, allowed editing and capacity increase, cancellation confirmation and dismissal, network-failure recovery, discovery removal, retained direct and activity access, and ended creator/participant history at 360×800, 768×1024 and 1440×900. Includes horizontal overflow and serious/critical accessibility checks.

## Quality and review

Standards review found no documented-standard violations or actionable heuristic smells. It identified a minute-precision form versus stored-second timestamp conflict; the fix compares the rendered minute values and preserves the exact locked timestamps, including during the final seconds before end. The reviewer confirmed the regression and both corrections. Spec review found no missing or incorrect ticket requirements. Review baseline: `d4f27862c7f119568935de2ac5085a9efc39bbcf`, using the working diff because review precedes the implement skill's commit.

Formatting, lint, Svelte/TypeScript checks and the production build passed. All 181 Vitest tests passed with `bunx vp test --run --pool=threads --maxWorkers=2`. The initial full browser run passed 84 of 88 tests; four tests timed out during overlap with other quality processes. All four passed in isolation with `bun run test:e2e --last-failed --workers=2`, completing all 88 browser cases successfully across the full run and targeted rerun.

The focused phone lifecycle workflow passed, and the full run passed the tablet/desktop workflows and ended history at all three sizes. Visual inspection confirmed readable phone edit locks and tablet retained-history badges without horizontal overflow. Use dedicated disposable databases and local test servers; this verification does not use the developer database.

Local diagnostic screenshots are generated under `test-results/lifecycle-locked-{width}.png` and `test-results/lifecycle-history-{width}.png`. These previews are implementation evidence, not final submission captures.

## Final Railway evidence plan

After the final release, record the deployed commit and capture date. Publish an Event and edit its response mode, schedule and Location before Participation. Join with another User, verify those fields are locked, increase capacity and demonstrate rejected reductions. Cancel through confirmation, verify removal from Discover and the Group's upcoming list where applicable, then open the retained direct link from My events and the participant's My activity. Confirm new Participation and withdrawals are blocked. Inspect an ended Event through creator and participant history and verify read-only controls.

Use CAP-06 to annotate cancelled/ended Participation history, supplement Event details with its clear lifecycle state, and include the capacity/cancellation scene in VIDEO-01 where timing permits. Keep final captures tied to the final Railway commit. No production service, production database or daily preview is needed for these local checks.
