# Selected cleanup scope

Accepted by Leo on 2026-11-13 after the architecture report and focused selection questions. This closes ticket 05's design work, not its implementation. Inputs: [original audit](audit.md), [organization audit and review reconciliation](organization-audit.md) and [complete proposed file map](organization-file-map.md), inspected at `fee222a`.

## Selected

- **Strong: organization and locality.** Adopt `lib/modules/` with module-local `server/` implementations for Events, Participation, Groups, Accounts and Locations. Preserve central infrastructure and cross-module server policy, generated UI utilities and framework route conventions. Use direct imports and meaningful filenames without adding abstraction for its own sake.
- **Strong: confirmed stale-code deletion.** Remove reference-checked starter examples and unused Group helpers, three helper-only tests and one redundant rollback case. Keep actual-operation, database invariant, concurrent transaction and real-worker tests. Review client-test configuration and dependencies alongside the sole example browser-component test.
- **Small dependency correction:** centralize the existing timezone policy in shared campus-time code in a distinct commit. Preserve its value and formatting behavior.
- **Documentation:** refresh the permanent navigation guide and README against the implemented source. Explain publication, registration and Location-search reading paths rather than duplicating migration bookkeeping.
- **Separate bug:** reproduce and correct map Retry draft loss without coupling it to the folder moves or a broad Location refactor.

## Deferred, without automatic implementation tickets

- **Worth exploring: Participation recovery deepening.** Duplication is real, but a configurable interface could require callers to understand as much as the original implementation. Revisit when recovery changes justify it.
- **Worth exploring: Location-selection deepening.** Coherent responsibility, but moving markup alone is insufficient and many bindings could increase interface complexity. Revisit with concrete evidence after organization.
- **Speculative: personal Event-list optimization.** Current operations already hide loading from callers. No measured bottleneck establishes a need to change it now.

The small clock-helper test and the email non-disclosure assertion remain investigatory. No broad test pruning, product UI redesign, schema change, server rule change or speculative interface is selected. No additional domain terms are introduced. Reversible folder organization does not require a new ADR here; preserve ADR 0001's lazy initialization and ADR 0002's shared Group-name policy.

## Execution tickets and dependencies

1. [07: E2E relocation](tasks/07-implement-selected-cleanup.md), following completed 05.
2. [11: Library organization](tasks/11-organize-library-modules.md), following 07 to serialize browser-test/import changes. Includes the separate timezone ownership commit.
3. [12: Confirmed stale-code removal](tasks/12-remove-confirmed-stale-code.md), following 11 to avoid overlapping Group operation/import edits.
4. [13: Navigation documentation](tasks/13-refresh-codebase-navigation-docs.md), following 12 so it describes the final tree.
5. [14: Map Retry bug](tasks/14-preserve-event-drafts-on-map-retry.md), independently startable, with edit coordination if 11 is active.

The serialization is an explicit practical choice for shared files, not a claim that moving E2E tests logically requires library refactoring. Ticket 10 waits on the selected slices as well as its prior blockers. Ticket 04 still owns seed safety and test/public fixture separation; if it changes paths before the restructuring, reconcile the proposed map rather than restoring old files. Default priority remains lowest-numbered eligible work, so 04 is next unless Leo chooses another order. This decision does not authorize implementation in parallel with another active editor.

## Preservation and verification

Keep existing URLs, discovery, authentication, Group permissions, publication, Participation, capacity and retained-history semantics. Folder moves require no UI prototype. Any later visible UI redesign must get one before implementation. The separate map bug ticket specifies its limited behavior change and reproduction requirement.

Use existing public operation interfaces, injected Clock and disposable SQLite/browser fixtures. For source changes run focused checks and the complete repository quality gate, including unit/operation tests, built browser journeys, real two-build updates, worker checks and production build. Confirm discovery did not lose or duplicate tests. Do not add tests of arbitrary file locations or implementation arrangements. Documentation-only selection work receives formatting, local-link, dependency and diff validation, not artificial product tests.

The architecture skill's read-only walk agreed on organization/deletion priority and deferring all three optional deepening candidates. Its visual HTML report was presented in the session from an OS temporary file; the durable candidate strengths, decisions and reasons are recorded above. Opus's earlier adversarial review and corrections remain in the organization audit. No deployment, daily preview, production data, push or PR is part of this decision.
