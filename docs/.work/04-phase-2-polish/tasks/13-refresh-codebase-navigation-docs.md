# 13: Refresh the codebase navigation guide

**What to build:** Give a teacher an accurate entry point and short architecture guide reflecting the implemented layout and capabilities.

**Blocked by:** [12: Remove confirmed starter code and obsolete Group tests](12-remove-confirmed-stale-code.md)

**Status:** ready

**Category:** enhancement

**Spec:** [Accepted cleanup scope](../cleanup-decision.md)

## Acceptance criteria

- [ ] README describes source-verified capabilities, removes stale Participation status and links the directory map, architecture guide, glossary and ADRs.
- [ ] The short guide traces Event publication, registration and Location search through routes, remote functions, operations, persistence and tests.
- [ ] The guide explains module-local server code, central policy/infrastructure exceptions, direct imports, colocated operation tests, E2E discovery and disposable data.
- [ ] docs/agents/domain.md reflects the final layout without changing domain meanings; historical evidence remains attributable to its original revision.
- [ ] Current file links resolve; prose formatting and diff checks pass. No new product tests are written for documentation.
- [ ] No local-source assertion is presented as verification of the live deployment.

## Implementation tasks

- [ ] Reconcile documentation with the final implemented tree, not just the proposed map.
- [ ] Keep detailed migration bookkeeping in the work tracker and stable concepts in the permanent guide.
- [ ] Apply writing-for-agents guidance when updating docs/agents/domain.md, and check all affected links.

## Comments

Final documentation follows source restructuring and deletion so it does not describe a future layout as implemented. Each earlier ticket still updates references it directly breaks.
