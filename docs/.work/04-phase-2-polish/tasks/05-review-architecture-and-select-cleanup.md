# 05: Review architecture and select bounded cleanup

**What to build:** Turn the quality audit into a reviewed, bounded cleanup design through the improve-codebase-architecture workflow, so implementation has concrete goals and preserved behavior rather than a broad rewrite mandate.

**Blocked by:** [03: Audit code quality and existing test coverage](03-audit-code-quality-and-test-coverage.md)

**Status:** completed

**Category:** enhancement

**Spec:** [Campus Connect Phase 2 polish](../spec.md)

## Acceptance criteria

- [x] The improve-codebase-architecture skill is run using the quality audit, current change hotspots, domain glossary and relevant architectural decisions.
- [x] Its architecture exploration and candidate report explain concrete friction, proposed improvements, benefits and recommendation strength.
- [x] The required design/grilling discussion selects a cleanup candidate and records scope, intended benefit, preserved behavior, testing boundary and any real dependencies.
- [x] The selected implementation is bounded to one fresh-context ticket. Larger or independent changes are split into focused follow-up tickets before implementation rather than hidden inside ticket 07.
- [x] Any UI/UX change is identified as requiring a prototype before implementation. Existing architectural decisions are preserved unless a separately justified change is agreed.
- [x] If no candidate is worth implementing, the decision and reason are recorded explicitly so downstream cleanup can be resolved without inventing a refactor.
- [x] This ticket produces reviewed decisions, not production code or live-state changes; documentation checks pass.

## Implementation tasks

- [x] Run the architecture skill and present its required candidate report.
- [x] Complete the design discussion and record the selected scope, testing approach and implementation dependencies.

## Comments

The quality audit must complete first. Do not make unrelated UI features wait for this workflow merely because cleanup is being considered.

2026-11-13: Completed the required architecture workflow, read-only code walk, visual candidate report and focused selection discussion. Leo accepted organization, confirmed stale-code/test removal, the small timezone ownership correction, navigation documentation and a separate map Retry bug. See [accepted scope and verification](../cleanup-decision.md). Ticket 07 is bounded to E2E relocation; tickets 11-14 split remaining work. Optional Participation/Location deepening and list optimization are deferred. No UI redesign, product implementation or live operation occurred. Documentation checks passed.
