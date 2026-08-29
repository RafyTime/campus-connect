# 11: Express interest and use basic My activity

**What to build:** Let an authenticated Explorer record or withdraw interest in a public interest Event and review upcoming interests in My activity. This ticket introduces Participation without depending on subscriber-only Events.

**Blocked by:** 05: Complete accounts, profiles, and protected actions.

**Status:** ready

## Acceptance criteria

- [ ] Participation records at most one relationship per User and Event and distinguishes interest from registration.
- [ ] An authenticated Explorer can record and withdraw interest for a scheduled public interest Event.
- [ ] Repeated interest or withdrawal requests return the resulting state without duplicate Participation or generic errors.
- [ ] Announcement Events expose no Participation mutation.
- [ ] An Event author cannot participate in that Event; another owner or representative may participate when not the author.
- [ ] A visitor receives the protected-action dialog instead of a Participation mutation.
- [ ] My activity lists the current User's upcoming interests with links to accessible Event details and a useful empty state.
- [ ] Authenticated navigation exposes My activity when the route becomes available.
- [ ] Interest controls and My activity expose pending, duplicate-action, forbidden, cancelled-or-unavailable, and server-failure states on representative viewports.
- [ ] Generated migrations work against a fresh database.
- [ ] This ticket adds deterministic Participation fixtures and idempotent seed helpers for interest, author-exclusion, and empty-state cases.
- [ ] Automated tests cover uniqueness, interest, withdrawal, response-mode rules, author exclusion, visitor handling, My activity, responsive behavior, and failures.
- [ ] The acceptance-to-evidence matrix records the tests and planned interest and My activity evidence.

## Implementation tasks

- [ ] Add Participation persistence and a generated migration.
- [ ] Add server application operations for recording and withdrawing interest and reading basic My activity.
- [ ] Add responsive interest controls to Event details, build the basic My activity view, and add My activity to authenticated navigation.
- [ ] Add deterministic fixtures and idempotent seed helpers for every Participation case introduced here.
- [ ] Add server and browser tests for the accepted interest and activity behavior.
- [ ] Update the acceptance-to-evidence matrix with test references and planned production, screenshot, and screencast evidence.

## Comments
