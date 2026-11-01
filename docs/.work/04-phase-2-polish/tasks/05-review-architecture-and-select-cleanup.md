# 05: Review architecture and select bounded cleanup

**What to build:** Turn the quality audit into a reviewed, bounded cleanup design through the improve-codebase-architecture workflow, so implementation has concrete goals and preserved behavior rather than a broad rewrite mandate.

**Blocked by:** [03: Audit code quality and existing test coverage](03-audit-code-quality-and-test-coverage.md)

**Status:** ready

**Category:** enhancement

**Spec:** [Campus Connect Phase 2 polish](../spec.md)

## Acceptance criteria

- [ ] The improve-codebase-architecture skill is run using the quality audit, current change hotspots, domain glossary and relevant architectural decisions.
- [ ] Its architecture exploration and candidate report explain concrete friction, proposed improvements, benefits and recommendation strength.
- [ ] The required design/grilling discussion selects a cleanup candidate and records scope, intended benefit, preserved behavior, testing boundary and any real dependencies.
- [ ] The selected implementation is bounded to one fresh-context ticket. Larger or independent changes are split into focused follow-up tickets before implementation rather than hidden inside ticket 07.
- [ ] Any UI/UX change is identified as requiring a prototype before implementation. Existing architectural decisions are preserved unless a separately justified change is agreed.
- [ ] If no candidate is worth implementing, the decision and reason are recorded explicitly so downstream cleanup can be resolved without inventing a refactor.
- [ ] This ticket produces reviewed decisions, not production code or live-state changes; documentation checks pass.

## Implementation tasks

- [ ] Run the architecture skill and present its required candidate report.
- [ ] Complete the design discussion and record the selected scope, testing approach and implementation dependencies.

## Comments

The quality audit must complete first. Do not make unrelated UI features wait for this workflow merely because cleanup is being considered.
