# 11: Express interest and use basic My activity

**What to build:** Let an authenticated Explorer record or withdraw interest in a public interest Event and review upcoming interests in My activity. This ticket introduces Participation without depending on subscriber-only Events.

**Blocked by:** 05: Complete accounts, profiles, and protected actions.

**Status:** completed

## Acceptance criteria

- [x] Participation records at most one relationship per User and Event and distinguishes interest from registration.
- [x] An authenticated Explorer can record and withdraw interest for a scheduled public interest Event.
- [x] Repeated interest or withdrawal requests return the resulting state without duplicate Participation or generic errors.
- [x] Announcement Events expose no Participation mutation.
- [x] An Event author cannot participate in that Event; another owner or representative may participate when not the author.
- [x] A visitor receives the protected-action dialog instead of a Participation mutation.
- [x] My activity lists the current User's upcoming interests with links to accessible Event details and a useful empty state.
- [x] Authenticated navigation exposes My activity when the route becomes available.
- [x] Interest controls and My activity expose pending, duplicate-action, forbidden, cancelled-or-unavailable, and server-failure states on representative viewports.
- [x] Generated migrations work against a fresh database.
- [x] This ticket adds deterministic Participation fixtures and idempotent seed helpers for interest, author-exclusion, and empty-state cases.
- [x] Automated tests cover uniqueness, interest, withdrawal, response-mode rules, author exclusion, visitor handling, My activity, responsive behavior, and failures.
- [x] The acceptance-to-evidence matrix records the tests and planned interest and My activity evidence.

## Implementation tasks

- [x] Add Participation persistence and a generated migration.
- [x] Add server application operations for recording and withdrawing interest and reading basic My activity.
- [x] Add responsive interest controls to Event details, build the basic My activity view, and add My activity to authenticated navigation.
- [x] Add deterministic fixtures and idempotent seed helpers for every Participation case introduced here.
- [x] Add server and browser tests for the accepted interest and activity behavior.
- [x] Update the acceptance-to-evidence matrix with test references and planned production, screenshot, and screencast evidence.

## Comments

Implemented on 2026-10-20. Application operations and remote functions enforce interest rules; the generated migration adds unique User/Event Participation with an explicit kind. Event details and authenticated navigation expose interest and My activity. Cancelled and ended interests are retained as required by the parent spec. Registration controls remain ticket 12; post-Participation editing locks and cancellation remain ticket 13.

Verification and final Railway capture plans are recorded in [the local check record](../../../evidence/phase-2/checks/11-interest-and-my-activity-local.md) and CORE-11 of [the acceptance matrix](../acceptance-evidence.md). Production checks and final screenshots/screencast are planned evidence, not performed by this ticket.
