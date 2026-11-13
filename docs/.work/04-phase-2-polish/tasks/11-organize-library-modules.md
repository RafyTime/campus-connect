# 11: Organize library code by module ownership

**What to build:** Apply the accepted module-local server layout so Events, Participation, Groups, Accounts and Locations have predictable homes, with explicit imports and preserved behavior.

**Blocked by:** [07: Consolidate browser journeys under e2e](07-implement-selected-cleanup.md)

**Status:** ready

**Category:** enhancement

**Spec:** [Accepted cleanup scope](../cleanup-decision.md)

## Acceptance criteria

- [ ] Retained library files follow the accepted [file map](../organization-file-map.md), adjusted explicitly for changes since fee222a. No source file is silently omitted.
- [ ] Product code lives under lib/modules/<name>/ with module-local server/ implementations; shell and named shared presentation/time helpers have their documented homes.
- [ ] Generated UI primitives, lib/utils.ts, central database/migrations, Group-key policy, campus catalog and production/test fixture writers retain the documented locations.
- [ ] Direct imports remain traceable; no universal barrels, pass-through abstractions, speculative interfaces or product behavior changes are introduced.
- [ ] Imports, auth generation command, seed/CLI references, service-worker offline-page import and the map test's Vite manifest source key follow the moves.
- [ ] Lazy DB/auth initialization, server-only import protection and Unicode Group-name uniqueness remain intact.
- [ ] Timezone ownership moves to shared campus-time policy in a distinct commit; the value and formatting behavior stay unchanged.
- [ ] All valid tests move with their implementation. Starter deletion and test pruning are left to ticket 12.
- [ ] Complete quality passes using the existing disposable setup, including worker typechecking, browser journeys, real two-build updates and production build. Discovery and browser/server import protection are verified.
- [ ] A concise implementation record explains the final locations and any justified deviation from the map.

## Implementation tasks

- [ ] Reconcile the mapping with the current tree, especially any ticket 04 seed changes; retain intentional policies rather than restoring old paths blindly.
- [ ] Move code and update imports/configuration in a behavior-preserving commit.
- [ ] Correct timezone ownership separately, then record proportionate checks and full quality results.

## Comments

The dependency on 07 serializes edits to browser tests and avoids moving an already-changing test tree. Ticket 04 remains independent and owns seed safety; if it runs first, adapt this map to its result. Do not redesign fixtures or deeper module interfaces here. No UI redesign or prototype is needed for import-only changes.
