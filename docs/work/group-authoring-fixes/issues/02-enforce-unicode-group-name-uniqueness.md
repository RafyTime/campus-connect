# 02: Enforce Unicode-aware Group name uniqueness

**What to build:** Reject case-equivalent Group names consistently during creation and editing, including German letters, with the existing usable inline name-conflict error. Keep the User's chosen capitalization for public display and enforce uniqueness in the database under concurrent requests.

**Parent:** [07: Create and edit Groups](../../phase-2-campus-connect/issues/07-create-and-edit-groups.md)

**Blocked by:** None (can start immediately). This fix is independent of ticket 01; the Group creation and editing implementation already exists.

**Status:** completed

## Acceptance criteria

- [x] Creation, editing, migration backfill, seed helpers, and fixtures use one documented Unicode normalization policy for the unique name key, including case handling, Unicode normalization form, and existing whitespace trimming. The policy treats `München Club` and `MÜNCHEN Club` as the same name.
- [x] A database constraint enforces uniqueness of the normalized name key. A name lookup alone is insufficient: concurrent attempts with equivalent names produce exactly one persisted Group and an explicit name-conflict result for the competing request.
- [x] Public display names retain the User's capitalization after the existing trimming behavior. Editing a Group without changing its name, or changing only its capitalization, succeeds unless it conflicts with another Group.
- [x] Creation and editing display the existing inline name-conflict error for Unicode-equivalent names, preserve entered values, and remain usable after rejection.
- [x] Migration checks existing Group names for collisions under the chosen policy and stops with an actionable report before changing conflicting data. Collision-free existing Groups are backfilled without changing display names, ownership, or relationships.
- [x] Regression tests cover Unicode conflicts on creation and editing, concurrent equivalent-name creation, unchanged-name and capitalization-only edits, migration collision detection, and successful migration of collision-free data. Existing ASCII uniqueness behavior continues to pass.
- [x] Relevant Group server and browser tests pass, and the parent ticket's acceptance-to-evidence matrix row records the regression coverage and verified results.

## Implementation tasks

- [x] Add failing regression tests for Unicode-equivalent names before changing normalization or schema behavior.
- [x] Define and document the normalization policy; use it consistently wherever Group names enter persisted data.
- [x] Add a database-enforced normalized name key and a migration with collision detection and safe backfill.
- [x] Keep database conflicts mapped to the usable name-conflict result for both creation and editing, including simultaneous requests.
- [x] Run the relevant checks and update the evidence references with the verified results.

## Comments

Review of the ticket 07 implementation at commit `55b704d` reproduced the existing name index accepting both `München Club` and `MÜNCHEN Club`. The forms and application validation accept Unicode names, but SQLite's built-in `lower(name)` handles ASCII case conversion only. The index predates ticket 07; the new authoring operations expose the acceptance-criterion failure.

Keep the database constraint as the authority for uniqueness. Apply the same policy to creation, editing, and existing data so that browser behavior, application validation, and migration results agree.

Implemented and verified locally on 2026-10-01. The Unicode creation regressions failed before the change: both `MÜNCHEN Club` and `MU\u0308NCHEN Club` were persisted beside `München Club`. The shared policy now computes trim, NFC, locale-independent Unicode lowercase, then NFC. Display names keep their spelling and capitalization after trimming. See [ADR 0002](../../../adr/0002-unicode-group-name-uniqueness.md).

Regression evidence:

- `src/lib/server/application/groups.spec.ts`: Unicode case and canonical-equivalence conflicts on creation and editing; unchanged-name and capitalization-only edits; fixture insert/update consistency; existing ASCII behavior.
- `src/lib/server/application/group-transactions.spec.ts`: simultaneous equivalent-name requests in private memory and file-backed SQLite persist one Group and one owner membership, with explicit `name-taken` results for competing requests.
- `src/lib/server/db/migrate.spec.ts`: German case, canonical-equivalence, and trimming collision reports; unchanged schema, data and journal after rejection; successful retry after resolving names; safe backfill preserving display fields, timestamps, ownership and Event relationships; unique index enforcement and idempotent reruns.
- `src/routes/group-management.e2e.ts`: unchanged and capitalization-only edits, Unicode conflicts in both forms, retained name/description values, enabled submit controls and successful correction.

Verified checks: 48 targeted Group/server/migration tests; 18 targeted Group browser tests; full unit suite 83 tests; full browser suite 41 tests; `bun run lint`; `bun run check` with zero errors or warnings; production build through the browser harness. On Windows, each preview process was stopped after all browser cases completed because teardown hung; both Playwright runs then reported success with exit code 0. Standards and Spec code reviews reported no actionable findings. CORE-07 in the parent's acceptance-to-evidence matrix records this coverage. Production verification remains part of the existing final Railway evidence plan.
