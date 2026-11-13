# 12: Remove confirmed starter code and obsolete Group tests

**What to build:** Delete verified unused examples and Group helpers, retaining meaningful behavior tests and required preview fixtures.

**Blocked by:** [11: Organize library code by module ownership](11-organize-library-modules.md)

**Status:** ready

**Category:** enhancement

**Spec:** [Accepted cleanup scope](../cleanup-decision.md)

## Acceptance criteria

- [ ] Current repository-wide reference checks confirm each deletion candidate remains unused, including links from submission documents.
- [ ] Remove confirmed demo routes, greeting implementations/tests and destination-placeholder; retain routes/preview and its acceptance-test consumers.
- [ ] Remove recordGroupMembership and assertGroupMutable, their unused result types and three helper-only Group cases when no active callers remain.
- [ ] Remove only the redundant Groups failed-owner rollback case; retain the stronger memory/file transaction test, direct database constraints and current-operation cases.
- [ ] If lib/index.ts and bare #lib are removed, verify no consumers require them and preserve #lib/* and UI generator alias resolution.
- [ ] Review the sole greeting browser-component test, the empty client Vitest project and unused vitest-browser-svelte/@vitest/browser-playwright dependencies together. Preserve real Playwright E2E and server test infrastructure; keep dependency lockfiles consistent.
- [ ] Deletion and necessary dependency/configuration changes are separate from path moves. No new smoke tests are added solely to prove deleted examples are absent.
- [ ] Complete quality passes; the result record names removed cases and the current requirements or stronger evidence retained.
- [ ] The clock-helper test and email non-disclosure assertion remain untouched pending an explicit requirement decision; no broad test-suite pruning occurs.

## Implementation tasks

- [ ] Use the stale-code inventory and case-level evidence in the [organization audit](../organization-audit.md), rechecking references at the implementation revision.
- [ ] Delete confirmed items in focused commits; update current documentation references.
- [ ] Run retained meaningful tests and the complete quality gate with disposable data.

## Comments

The dependency on 11 serializes changes to the same Group operations and imports. Unused seed exports remain ticket 04 follow-up rather than an excuse to change seed semantics here. Test pruning is requirement-specific; the audit is not permission to remove whole Group suites.
