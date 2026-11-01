# 07: Implement the selected bounded cleanup

**What to build:** Implement the reviewed cleanup selected by ticket 05 while preserving the working application behavior and public testing boundaries. Deliver a verifiable improvement rather than a blanket codebase rewrite.

**Blocked by:** [05: Review architecture and select bounded cleanup](05-review-architecture-and-select-cleanup.md)

**Status:** ready

**Category:** enhancement

**Spec:** [Campus Connect Phase 2 polish](../spec.md)

## Acceptance criteria

- [ ] The implementation follows the selected scope and benefit recorded by ticket 05; unrelated findings are not bundled into it.
- [ ] Any UI/UX effect has a reviewed prototype before implementation, and any genuine newly discovered prerequisite is recorded explicitly.
- [ ] Existing discovery, authentication, Group, publication, Participation, capacity and retained-history behavior remains intact except for separately agreed feature changes.
- [ ] Lazy runtime database/authentication initialization and Unicode Group-name uniqueness remain preserved.
- [ ] Existing behavioral tests continue to exercise the relevant public boundaries without adding casting wrappers, speculative interfaces or implementation-detail tests.
- [ ] The complete repository quality command passes and a concise result record explains the achieved benefit and its validation.
- [ ] If ticket 05 selected no worthwhile cleanup, this ticket is explicitly resolved as wontfix with that reason; it is not silently marked implemented.

## Implementation tasks

- [ ] Apply the selected bounded change and keep explanatory comments in sync.
- [ ] Run focused behavior verification and the full quality command, then record the result.

## Comments

Ticket 05 is the architecture/design prerequisite. A wider set of changes must be split into additional reviewed slices; those become prerequisites of the final handoff if accepted into this polish scope.
