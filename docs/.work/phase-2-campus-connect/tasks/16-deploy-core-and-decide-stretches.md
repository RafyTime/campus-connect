# 16: Deploy the committed core and decide stretch paths

**What to build:** Deploy and verify the committed core on Railway, then record three independent Phase 2 go or no-go decisions: subscriber-only Events, Nominatim geocoding, and the Group updates plus Notifications package.

**Blocked by:** 15: Audit committed-core quality across journeys.

**Status:** ready

## Acceptance criteria

- [ ] The reviewed, CI-green committed-core revision is running on the single Railway application instance with its attached SQLite volume.
- [ ] Production migration and idempotent seed commands complete from the running service rather than the build or pre-deploy phase.
- [ ] The deployed application passes smoke checks for registration or sign-in, public filtering, Event details, follow and subscriber counts, interest, registration, creator authorization, mapped Locations, and mobile navigation.
- [ ] A manual desktop Firefox smoke check finds no submission-blocking issue; Safari remains outside the Phase 2 gate.
- [ ] Manual keyboard checks cover the main committed journeys and record any remaining issue.
- [ ] The deployed commit, deployment date, smoke results, and evidence-capture rehearsal outcome are recorded without exposing credentials or treating rehearsal artifacts as final submission evidence.
- [ ] Separate go or no-go decisions are recorded for subscriber-only Events, Nominatim geocoding, and Group updates plus Notifications.
- [ ] Each no-go decision records its reason, marks the affected stretch ticket or package `wontfix`, and adds the behavior to Phase 3 deferrals.
- [ ] Each go decision leaves its stretch ticket ready and states the evidence needed before final release.

## Implementation tasks

- [ ] Complete the core deployment runbook, migration command, seed command, smoke checklist, and three stretch-decision records.
- [ ] Verify that the release command and Railway lifecycle preserve lazy runtime database and authentication initialization.
- [ ] Update the acceptance-to-evidence matrix with the production-check locations and separate stretch decision fields.
- [ ] After the three decisions are recorded, update the affected stretch ticket statuses, Phase 3 deferrals, and evidence-matrix outcomes.

## Project delivery

- [ ] In the Railway console, deploy the reviewed CI-green core revision to the single application instance and retain the deployment record as proof.
- [ ] From the running Railway service, apply the production migration once and run the idempotent seed command; retain the successful command output without credentials.
- [ ] In the deployed application, complete the committed-core smoke checklist and record the deployed commit, date, outcomes, and any defect in the evidence matrix.
- [ ] In desktop Firefox and the deployed application, complete the manual browser and keyboard checks and record their outcomes in the evidence matrix.
- [ ] In the course Drive folder, add a dated stretch-decision record with separate go or no-go outcomes and reasons for tickets 17, 18, and the 19 plus 20 package; retain that record as proof.

## Comments
