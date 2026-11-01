# Ticket 16: core release and stretch gates

Date: 2026-10-29 (Europe/Berlin). This is a deployment-check and capture-rehearsal record, not final submission evidence.

## Release identity

- Deployed core: `ce3b7dddbaa30f30a49d7a1e12380c05e2e791bb` (ticket 15 audit and evidence committed).
- CI: [quality run 40866435520](https://github.com/RafyTime/campus-connect/actions/runs/40866435520), completed successfully on 2026-10-29. Railway honored Wait for CI before building.
- Railway project: `b8b909fc-24c6-4e35-8e5d-18ea58d8e69f`; environment: production (`a287427d-d0c4-4447-9236-4988167bea61`).
- Service: campus-connect (`774389d5-4ab0-45c8-b1eb-91570ea6a042`).
- Deployment: `161e4689-2e8a-4374-8d96-1a59c5d0730d`, observed `SUCCESS` at 2026-10-29 11:42:11 UTC (12:42:11 Europe/Berlin). Runtime SSH independently confirmed the full deployed SHA and deployment ID.
- Public application: <https://campus-connect-92111978.up.railway.app>.
- Read-only configuration inspection: GitHub `main`, Wait for CI enabled, one replica in EU West, existing 500 MB volume mounted at `/data`, no staged changes, no configured pre-deploy command. Secret values were not retrieved.

## Runtime migration and seed

After `SUCCESS`, SSH confirmed the exact deployed revision and expected database/origin comparisons. Commands ran sequentially inside the running service:

```text
bun run db:migrate
Applied database migrations.
Exit: 0

bun run db:seed
Seeded public Events and Groups.
Exit: 0
```

The post-command journal still contains the same five committed hashes and timestamps. No build or pre-deploy database command was used. Runtime logs show Node listening on port 8080 and the volume mounted. No production secrets were retrieved.

Pre-release read-only SSH inspection found the previous running revision `563bd756310027f9ac2e7904c589ba6f9b24dfc5` on deployment `27407761-3626-46d1-91c1-36dca1e21ef2`. Boolean comparisons confirmed the expected volume database path and public origin without printing environment values. All five journal hashes and timestamps matched `readMigrationFiles({ migrationsFolder: 'drizzle' })` from the candidate: migrations 0000 through 0004 are applied; there is no pending schema migration. The runtime migration was consequently a successful no-op.

The seed uses stable IDs but refreshes demo Event dates and restores seeded Group memberships. Run it before follow and Participation checks, never between a check and its persistence verification. Do not run the testing account seed against production.

## Production smoke results

Checked on 2026-10-29 in the Codex in-app browser against the deployed SHA above. Initial checks used the narrow mobile layout. Follow-up checks used explicit 360x800, 768x1024 and 1440x900 viewports; Leo separately reported the requested desktop Firefox checklist passed.

- Passed: synthetic account registration from an Event protected-action prompt, correct HTTPS return to that Event without replaying the action, refresh persistence, sign-out, fresh sign-in and another refresh.
- Passed: public discovery initially showed nine scheduled seeded Events after the seed. Combined Film Society and Group-host filters produced one Event and persisted in the URL after refresh. Food produced zero results with a recovery message; Clear all restored results. Today produced the one Event scheduled today.
- Passed: personal and Group Event details, hosts, response modes, Tags, schedules, safe visitor prompt, mapped Location marker and attribution. The published plain-text Location rendered its label without a map.
- Passed: Film Society Follow changed 1 subscriber to 2, persisted after refresh, and Unfollow restored 1.
- Passed: interest on Campus film night persisted after refresh and appeared in My activity. It was withdrawn afterward.
- Passed: Statistics study group registration changed 12 available / 0 confirmed to 11 / 1, persisted after refresh, and appeared in My activity. Cancellation restored 12 / 0. The full workshop showed 0 remaining and a disabled Full button.
- Passed: the synthetic Creator published and edited a personal Event; then created a rehearsal Group, became its owner, and published and edited a Group Event. Both appeared in Discover and My events. Opening another Creator's edit route showed Access denied.
- Passed: phone bottom navigation reached Groups, Create, My activity and My events; the mobile filter sheet opened and closed, and its controls were usable.
- Passed: public HTTPS returned 200. A valid-shaped authentication POST with a mismatched Origin returned 403 / INVALID_ORIGIN. The first empty-body probe returned 400, so it was not counted as an Origin check.
- Bounded runtime logs contained generic Authentication warning/error entries during the negative authentication probes, with no credential payloads or database errors observed. Successful registration/sign-in and subsequent mutations worked. Do not infer wider log coverage from this bounded inspection.

### Browser, keyboard and responsive checks

- [x] Manual desktop Firefox: Leo reported “everything works on Firefox too” on 2026-10-29 in response to the discovery/map, authentication, follow, Participation, creator and keyboard checklist. No issue was reported. This is user-reported evidence; Firefox version was not supplied. Safari remains outside the gate.
- [x] Manual keyboard checklist: accepted from Leo’s report against the requested Tab, Shift+Tab, Enter, Space and Escape checks across the main journeys; no issue reported. The separate in-app keyboard spot check passed Tab to Skip to main content, Enter plus Tab to Filters, Enter to open, and Escape restoring focus to Filters. No independent Firefox automation was performed.
- [x] Representative production viewport checks: Discover, creator form and mapped Event inspected at 360x800, 768x1024 and 1440x900. DOM viewport measurements matched the requested dimensions; document width never exceeded viewport width on those pages. Screenshots showed usable layouts, readable map attribution and centered markers. Phone form bottom controls were reached by keyboard; the 360x800 filter sheet had reachable Close, Clear all and Done controls, and phone/tablet bottom navigation fit. The desktop Host popover opened and exposed its controls. Local automated coverage retains the broader validation/error/dialog checks at all three sizes.
      Additional final-release check (not a new ticket 16 stretch gate): directly inspect session-cookie Secure/HttpOnly/SameSite attributes without recording values. HTTPS session persistence and same-origin mutations passed, but those attributes were not directly inspected in this rehearsal.

## Rehearsal content and disposition

The synthetic release account's credentials were generated for this run and were not recorded in the repository. Rehearsal Group: `f1045c63-1616-42a3-b69a-fd61158fcc41`, named Release rehearsal 2026-10-29.

- Personal Event: `2c630beb-fd10-493e-9fd8-9a7a1888e4a0`, Release rehearsal — personal Event.
- Group Event: `87c9489a-c5c1-4f9a-a3f9-0a28194a49eb`, Release rehearsal — Group Event.

Leo explicitly approved cancelling both rehearsal Events on 2026-10-29. Both were then cancelled through their normal edit-page confirmation controls. Each edit page reported the Event cancelled and read-only, with details and Participation retained. Discover returned from eleven Events to the original nine; neither rehearsal Event appeared in its result list. The earlier automatic-approval rejection was resolved by that explicit user authorization. No account or Group records were deleted.

## Evidence-capture rehearsal

Pass for scene/capture feasibility: the deployed scenes for filtering, Event/map, visitor prompt, follow, interest and registration, My activity, personal/Group publication, capacity and mobile navigation were obtainable. A narrow-layout My activity rehearsal PNG was saved outside the repository at `/tmp/campus-connect-16-rehearsal-my-activity.png`; it is not final submission evidence. Desktop Discover framing was subsequently rehearsed at 1440x900 and phone Discover at 360x800, with temporary PNGs `/tmp/campus-connect-16-desktop-rehearsal.png` and `/tmp/campus-connect-16-phone-rehearsal.png`. Exact viewport checks passed as described above. These are rehearsal artifacts only. The shot list remains feasible; recording, editing and timing the final 95–110 second video belongs to ticket 22, after stretch outcomes are resolved. No final submission media was produced.

## Local validation and lifecycle

`vp run quality` passed after the runbook was added: formatting, lint, zero Svelte/TypeScript errors or warnings, 183 unit/integration tests, 105 Playwright tests, and the production Node-adapter build. The initial sandboxed attempt could not bind Vitest's local port; the completed run used local server access.

Code inspection confirmed lazy cached `getDb()` and `getAuth()` and the build guard in `src/hooks.server.ts` remain intact. Railway built with the runtime-volume database setting and no build-time database preparation, then started successfully with its mounted volume. Migration and seed remain explicit runtime commands.

## Independent stretch decisions

The core gate passed, and Leo confirmed all three independent outcomes for closeout on 2026-11-01. [The dated decision record](16-stretch-decisions-2026-11-01.md) is the canonical scope/evidence record.

- Subscriber-only Events (17): **no-go; wontfix**. Restricted audiences are lower priority than improving the completed public journey. Conditional implementation/capture requirements are waived and the full slice is deferred to Phase 3.
- Nominatim geocoding (18): **go; ready**. Explicit address search improves existing Location authoring. Complete replacement-provider tests, cache/throttle/bounds/selection/fallback behavior, documented configuration and Railway/final-media evidence remain required before release. Go does not mean implemented.
- Group updates plus Notifications (19-20): **no-go as a package; both wontfix**. Improve existing Participation, next plans and cancelled/ended presentation before adding another content/delivery system. Both halves are deferred to Phase 3 with conditional implementation/capture requirements waived.

The affected tickets, Phase 3 deferrals and matrix outcomes are updated. On 2026-11-01 Leo explicitly waived the duplicate Drive-retention item because there is no Google Drive connection. The dated repository decision record is the retained proof; no upload is claimed. Ticket 16 is completed. Later final-release and submission evidence remains separate.
