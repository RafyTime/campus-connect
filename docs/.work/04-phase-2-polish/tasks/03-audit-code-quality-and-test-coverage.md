# 03: Audit code quality and existing test coverage

**What to build:** Produce an evidence-backed inventory of concrete code-quality friction and relevant test coverage so cleanup can target real problems. This is directly startable read-only evidence work, not a redesign or implementation ticket.

**Blocked by:** None (can start immediately).

**Status:** ready

**Category:** enhancement

**Spec:** [Campus Connect Phase 2 polish](../spec.md)

## Acceptance criteria

- [ ] The audit identifies concrete duplication, confusing responsibilities, stale code and inconsistent components, with affected behavior, evidence and likely scope for each finding.
- [ ] The review considers recent change hotspots, Participation and Creator views, shared Event presentation, navigation/theme/PWA handling and shared seed helpers without assuming these require refactoring.
- [ ] Existing browser, server-operation, clock and disposable-database testing boundaries are mapped to the affected behavior, and meaningful coverage gaps are distinguished from implementation-detail tests.
- [ ] Findings distinguish functional defects or agreed feature work from optional architectural cleanup and do not prescribe speculative modules.
- [ ] The report identifies bounded architecture candidates and any genuine dependencies that later tickets need, while preserving the existing runtime-initialization and Group-name policies.
- [ ] No product, production or database mutation is performed as part of the audit. Documentation checks pass for its report.

## Implementation tasks

- [ ] Read the domain glossary and relevant architectural decisions, inspect the current implementation and existing tests, and collect concrete evidence.
- [ ] Write a concise audit/coverage report with priorities and candidate scope for the architecture workflow.

## Comments

Run after the preferred dark-mode/PWA work by execution priority, but this ticket has no technical blockers and needs no prior prototype, grilling session or architecture-selection task.
