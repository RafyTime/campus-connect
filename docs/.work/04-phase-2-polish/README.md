# Phase 2 polish tickets

Execution priority approved on 2026-11-01: dark mode, mobile installation, then offline recovery/safe updates before the remaining polish work. This supersedes the earlier audit-first preference recorded during specification synthesis.

Work the lowest-numbered eligible ticket by default. Priority and blocking are distinct: a later ticket without blockers is technically startable, but does not outrank the preferred dark-mode/PWA work. Prototypes, architecture review and content grilling remain prerequisites within their owning tickets.

Read each ticket's `Status` for current progress. A `ready` ticket may still have unresolved blockers. Publishing this backlog alone does not authorize production work.

## Tickets

- [00: Prototype and deliver theme preferences and matching maps](tasks/00-deliver-theme-preferences-and-maps.md) — blocked by: none.
- [01: Prototype and deliver mobile installation and standalone use](tasks/01-deliver-mobile-installation-and-standalone-use.md) — blocked by: none.
- [02: Prototype and deliver offline recovery and safe updates](tasks/02-deliver-offline-recovery-and-safe-updates.md) — blocked by: 01.
- [03: Audit code quality and existing test coverage](tasks/03-audit-code-quality-and-test-coverage.md) — blocked by: none.
- [04: Make routine seeding safe and separate public test fixtures](tasks/04-preserve-data-during-routine-seeding.md) — blocked by: none.
- [05: Review architecture and select bounded cleanup](tasks/05-review-architecture-and-select-cleanup.md) — blocked by: 03.
- [06: Prototype and deliver clearer plans and navigation](tasks/06-deliver-clearer-plans-and-navigation.md) — blocked by: none.
- [07: Implement the selected bounded cleanup](tasks/07-implement-selected-cleanup.md) — blocked by: 05.
- [08: Agree the final campus demonstration catalog](tasks/08-agree-campus-demonstration-catalog.md) — blocked by: none.
- [09: Deliver the agreed dataset and explicit refresh operation](tasks/09-deliver-campus-dataset-and-explicit-refresh.md) — blocked by: 04, 08.
- [10: Verify integrated polish and prepare release handoff](tasks/10-verify-polish-and-prepare-release-handoff.md) — blocked by: 00, 02, 06, 07, 09; original Phase 2 18.

## Release connection

[Original Phase 2 ticket 21](../01-phase-2-campus-connect/tasks/21-finalize-release-and-repository-docs.md) must wait for [polish ticket 10](tasks/10-verify-polish-and-prepare-release-handoff.md) as well as its existing stretch blockers. Original tickets 22-24 retain the final-evidence, presentation and submission sequence. Original ticket 16 still records the stretch outcomes; geocoding remains in original ticket 18.

The general audit and seed-safety correction are independent of final campus-content selection. Cleanup follows its selected architecture outcome; UI/UX work includes a prototype before implementation. If the architecture review identifies a real new dependency or additional accepted cleanup slices, record those edges explicitly rather than silently expanding a ticket.
