# 16: Deploy the committed core and decide stretch paths

**What to build:** Deploy and verify the committed core on Railway, then record three independent Phase 2 go or no-go decisions: subscriber-only Events, Nominatim geocoding, and the Group updates plus Notifications package.

**Blocked by:** 15: Audit committed-core quality across journeys.

**Status:** completed

## Acceptance criteria

- [x] The reviewed, CI-green committed-core revision is running on the single Railway application instance with its attached SQLite volume.
- [x] Production migration and idempotent seed commands complete from the running service rather than the build or pre-deploy phase.
- [x] The deployed application passes smoke checks for registration or sign-in, public filtering, Event details, follow and subscriber counts, interest, registration, creator authorization, mapped Locations, and mobile navigation.
- [x] A manual desktop Firefox smoke check finds no submission-blocking issue; Safari remains outside the Phase 2 gate.
- [x] Manual keyboard checks cover the main committed journeys and record any remaining issue.
- [x] The deployed commit, deployment date, smoke results, and evidence-capture rehearsal outcome are recorded without exposing credentials or treating rehearsal artifacts as final submission evidence.
- [x] Separate go or no-go decisions are recorded for subscriber-only Events, Nominatim geocoding, and Group updates plus Notifications.
- [x] Each no-go decision records its reason, marks the affected stretch ticket or package `wontfix`, and adds the behavior to Phase 3 deferrals.
- [x] Each go decision leaves its stretch ticket ready and states the evidence needed before final release.

## Implementation tasks

- [x] Complete the core deployment runbook, migration command, seed command, smoke checklist, and three stretch-decision records.
- [x] Verify that the release command and Railway lifecycle preserve lazy runtime database and authentication initialization.
- [x] Update the acceptance-to-evidence matrix with the production-check locations and separate stretch decision fields.
- [x] After the three decisions are recorded, update the affected stretch ticket statuses, Phase 3 deferrals, and evidence-matrix outcomes.

## Project delivery

- [x] In the Railway console, deploy the reviewed CI-green core revision to the single application instance and retain the deployment record as proof.
- [x] From the running Railway service, apply the production migration once and run the idempotent seed command; retain the successful command output without credentials.
- [x] In the deployed application, complete the committed-core smoke checklist and record the deployed commit, date, outcomes, and any defect in the evidence matrix.
- [x] In desktop Firefox and the deployed application, complete the manual browser and keyboard checks and record their outcomes in the evidence matrix.
- [x] Waived by Leo on 2026-11-01: the course Drive decision-copy requirement does not apply because there is no Google Drive connection. The dated repository decision record is retained as proof; no Drive upload is claimed.

## Comments

2026-10-29: Release preparation and live inspection started. [Release record and smoke checklist](../../../evidence/phase-2/checks/16-core-release.md) track the exact candidate, Railway deployment, runtime commands, rehearsal and separate stretch decisions. [Deployment runbook](../../../deployment.md#ticket-16-committed-core-release) documents the runtime-only migration/seed sequence. CI passed and deployment `161e4689-2e8a-4374-8d96-1a59c5d0730d` reached SUCCESS for `ce3b7dd`. Runtime migration and seed succeeded, followed by in-app core smoke checks and a partial capture rehearsal. `vp run quality` passed (183 unit/integration and 105 Playwright tests plus lint/typecheck/build). Follow-up: Leo reported the requested desktop Firefox and keyboard checklist passed (browser version unspecified); representative production viewport checks and capture-feasibility rehearsal also passed. Ticket remains `ready` for the three stretch choices and Drive retention. Leo requested discussing stretch choices after core work; tickets 17–20 retain their statuses. Leo explicitly approved cancelling both rehearsal Events; both cancellations were verified through read-only edit states and their removal from Discover. Rehearsal account and Group records remain.

2026-11-01 — Repository closeout: [the dated decision record](../../../evidence/phase-2/checks/16-stretch-decisions-2026-11-01.md) records 17 no-go (`wontfix`), 18 go (`ready` with release evidence specified), and 19-20 no-go together (both `wontfix`). Conditional go work is waived on the deferred tickets, Phase 3 deferrals and matrix outcomes are updated, and the approved polish backlog remains separate. All repository acceptance/implementation work is complete. The remaining Drive-copy item was subsequently explicitly waived by Leo because there is no Google Drive connection; the canonical dated record is retained in the repository. No successful Drive upload is claimed.

2026-11-01 — **Completed.** Leo explicitly instructed: “There's no Google Drive connection, so ignore that.” The course Drive copy is therefore waived, with the public-safe repository decision record retained as the proof. All other required checklists are complete. Tickets 17, 19 and 20 are `wontfix`; ticket 18 remains `ready` with its full implementation/release evidence requirements. The new polish backlog and later final release remain separate work.
