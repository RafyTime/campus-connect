# 19: Publish Group updates

**What to build:** If the updates plus Notifications package gate is go, add authorized public text-only Group updates and a separate Updates view. Keep the feature unexposed until ticket 20 completes the package. A no-go decision resolves both package tickets as `wontfix`.

**Blocked by:** 16: Deploy the committed core and decide stretch paths.

**Status:** wontfix

## Acceptance criteria

- [x] The ticket records the shared Group updates plus Notifications gate outcome from ticket 16.
- [ ] For a go decision, an owner or representative can publish a Group update with a title of 5 to 100 characters and plain-text body of 1 to 2,000 characters.
- [ ] For a go decision, an authorized owner or representative can edit and delete an update; subscribers, unrelated Users, and visitors cannot mutate it.
- [ ] For a go decision, Group pages and a separate Updates view show public updates newest first with author and publication time.
- [ ] For a go decision, Event filters never apply to Group updates.
- [ ] For a go decision, images, comments, reactions, pinning, drafts, and scheduled publishing are absent.
- [ ] For a go decision, Campus Updates remains system-managed and ordinary Users cannot edit it.
- [ ] For a go decision, the incomplete package remains hidden from production navigation and public use until ticket 20 passes.
- [ ] For a go decision, automated tests cover validation, ordering, authorization, editing, deletion, separation from Events, responsive behavior, and failures.
- [ ] For a go decision, the acceptance-to-evidence matrix records tests and the package's production, screenshot, and screencast evidence needs.
- [x] For a no-go decision, tickets 19 and 20 are `wontfix`, their implementation checklists are explicitly waived in Comments, no package feature is exposed, and Phase 3 and evidence records state the deferral.

## Implementation tasks

- [ ] For a go decision, add Group update persistence and any generated migration without exposing the unfinished package.
- [ ] For a go decision, add deterministic fixtures and idempotent seed helpers for Group updates and relevant roles.
- [ ] For a go decision, add authorized create, edit, delete, Group-page, and separate Updates-view behavior behind the package release boundary.
- [ ] For a go decision, add server and browser tests for validation, authorization, ordering, separation, responsive behavior, and failures.
- [x] Update the acceptance-to-evidence matrix with the package gate outcome and, when shipping, its test references and production evidence needs.

## Comments

2026-11-01 — **No-go for Phase 2.** The complete Group updates plus Notifications package is deferred so Phase 2 can improve clarity around existing Participation and next/ended/cancelled plans instead of adding another content and delivery system. [Dated decision](../../../evidence/phase-2/checks/16-stretch-decisions-2026-11-01.md) and [Phase 3 deferrals](../phase-2-spec.md#phase-3-candidates) record the outcome. The gate and matrix updates are complete. All conditional go-only acceptance criteria and implementation/testing/capture checklist items are explicitly waived for Phase 2; unchecked go-only boxes do not represent incomplete shipped work. Tickets 19 and 20 share this outcome. The public-only core remains the release baseline; this decision introduces no feature code.
