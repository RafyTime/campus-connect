# 21: Finalize the release and repository documentation

**What to build:** Resolve every stretch path, document the exact Phase 2 result, and deploy the final reviewed revision. The repository and Railway application must agree about what shipped, what moved to Phase 3, and how to reproduce and operate the release.

**Blocked by:** 17: Add subscriber-only Events; 18: Add Nominatim geocoding; 20: Deliver Notifications and release the stretch package.

**Status:** ready

## Acceptance criteria

- [ ] Each stretch path is either completed or explicitly `wontfix`; no incomplete stretch control or route is exposed.
- [ ] The README documents prerequisites, environment variables, migrations, seeding, development, tests, build, run, release, and deployment.
- [ ] Repository documentation describes the final architecture, domain rules, Railway lifecycle, single-instance SQLite constraint, Phase 1 changes, shipped scope, Phase 3 deferrals, known limits, and external attribution.
- [ ] Non-obvious authorization, registration concurrency, Railway lifecycle, and any shipped geocoding cache or throttle decisions are commented where the code alone does not explain them; routine syntax remains uncommented.
- [ ] Every generated migration applies successfully to a fresh database in order.
- [ ] The release command passes for the exact revision selected for final deployment.
- [ ] The final reviewed revision runs on Railway, and any required production migration is applied once from the running service after a backup when meaningful data exists.
- [ ] The idempotent seed operation leaves the final demonstration dataset in the expected state.
- [ ] Production smoke checks cover every committed journey and each stretch path that shipped.
- [ ] Logs and repository content expose no passwords, session tokens, demonstration credentials, or complete authentication payloads.
- [ ] The deployed commit, date, migration result, seed result, smoke results, and final stretch outcomes are recorded in the acceptance-to-evidence matrix.

## Implementation tasks

- [ ] Complete the README and repository documentation for setup, architecture, domain rules, testing, release, Railway operation, attribution, changes, limits, and deferrals.
- [ ] Audit comments around non-obvious authorization, registration concurrency, Railway lifecycle, and any shipped geocoding cache or throttle behavior; add only the context needed to explain those decisions.
- [ ] Remove or hide incomplete stretch code paths and controls according to the recorded outcomes.
- [ ] Verify all migrations against a fresh disposable database and run the complete release command for the final revision.
- [ ] Finalize the repository-backed deployment, migration, seed, backup, and smoke checklists without embedding credentials.
- [ ] Update the acceptance-to-evidence matrix with final scope, test results, production check locations, and evidence still to capture.

## Project delivery

- [ ] In the Railway console, back up the production database before any later schema migration when it contains meaningful data; retain the backup record as proof or record why no backup was required.
- [ ] In the Railway console, deploy the reviewed CI-green final revision and retain the deployment record with its commit identifier.
- [ ] From the running Railway service, apply required migrations once and run the idempotent seed operation; retain successful output without credentials.
- [ ] In the deployed application, smoke-test all committed journeys and each shipped stretch path; record results, date, and deployed commit in the evidence matrix.

## Comments
