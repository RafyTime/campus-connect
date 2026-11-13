# 07: Consolidate browser journeys under e2e

**What to build:** Move cross-feature Playwright journeys out of application routes into root e2e/, keeping their behavior and disposable-data setup intact.

**Blocked by:** [05: Review architecture and select bounded cleanup](05-review-architecture-and-select-cleanup.md)

**Status:** ready

**Category:** enhancement

**Spec:** [Accepted cleanup scope](../cleanup-decision.md)

## Acceptance criteria

- [ ] All route-level *.e2e.ts files move directly to e2e/; event-form.testing.ts moves to e2e/support/ with imports updated.
- [ ] The ordinary Playwright config explicitly discovers these journeys without discovering e2e/updates/pwa.spec.ts; the separate two-build update config retains its own discovery.
- [ ] Existing journey assertions, service-worker policies, temporary database setup and test-account tools are preserved.
- [ ] Unit and operation tests remain colocated; no product routes, URLs or behavior change.
- [ ] Test discovery is checked for omissions or duplicates; the complete existing quality command passes on disposable local data.
- [ ] Documentation and current references affected by this move are updated, without rewriting historical test results.

## Implementation tasks

- [ ] Follow the E2E entries in the [file map](../organization-file-map.md), and update configuration, helper imports and relevant source references.
- [ ] Record discovery comparison and quality results. Do not add tests of file locations.

## Comments

2026-11-13: Ticket 05 selected this as ticket 07's bounded implementation. Other cleanup is split into tickets 11-14. No deployment, production data changes, push or PR is authorized by this ticket.
