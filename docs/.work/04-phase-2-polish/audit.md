# Code quality and coverage audit

The [organization and navigability extension](organization-audit.md) records the second audit, agreed goals, alternatives and complete file disposition. It supplements the findings below; it does not authorize implementation.

Date: 2026-11-12. Reviewed revision: `ede45a0`. Scope: ticket 03, source and test inspection only. No application tests were rerun, so this report makes no fresh suite-pass or measured-performance claim. No product code, database, preview channel or production system was changed.

## Findings

Priority describes follow-up value within this finishing pass, not production incident severity. Source links identify the inspected implementation; named functions locate the evidence without depending on line numbers.

### 1. Routine seeding overwrites existing content and memberships

High priority, existing corrective work owned by ticket 04. [seed.ts](../../../src/lib/server/seed.ts) calls fixture writers for ordinary setup. [fixtures.ts](../../../src/lib/server/fixtures.ts) uses conflict updates for Users, Locations, Groups, Posts and Events; `insertGroup` deletes all memberships for the Group before rebuilding them, and Event insertion replaces Tags. Seed schedules are recalculated relative to the clock. This can overwrite manual edits and subscriptions on repeat setup. Public examples also include deliberate XSS strings and a broken image URL.

The six tests in [seed.spec.ts](../../../src/lib/server/seed.spec.ts) establish representative content and stable counts/history on repeated seeding, not preservation of edited rows or memberships. Ticket 04 should exercise edited seeded records, manually added data, subscriptions and Participation across reruns through the existing disposable database. Separate public initialization from deterministic test reset semantics; retain fixture reset behavior needed by other suites. Final campus content remains tickets 08/09. No architecture review is needed to establish this already specified correction.

### 2. Personal plans still mix commitments with interests and history

High priority, agreed feature work owned by ticket 06. `listMyActivity` in [participation.ts](../../../src/lib/server/application/participation.ts) orders all records by start time. [My activity](../../../src/routes/my-activity/+page.svelte) renders one grid with a Badge per item. Old records precede upcoming registrations. [navigation.ts](../../../src/lib/navigation.ts) exposes My activity and My events as adjacent destinations; [My events](../../../src/routes/my-events/+page.svelte) is the Creator management view. Their different permissions are intentional even though their layouts look similar.

[events.ts](../../../src/lib/server/application/events.ts) derives cancelled/ended/scheduled status, without distinguishing ongoing from upcoming. This is unfinished polish scope, not evidence that persisted statuses or the database need redesign. Existing lifecycle tests cover exact end, cancelled history and mutation locks; Participation and registration suites cover ownership, withdrawal and retained history. Ticket 06 needs mixed-plan ordering and grouping, exact start/end transitions and cancellation precedence through returned plan behavior, then keyboard/navigation and responsive browser journeys. Preserve Creator access tests when labels or routes change.

### 3. Participation controls duplicate the same recovery sequence

Medium priority, optional architecture candidate for ticket 05. [Interest controls](../../../src/lib/components/interest-controls.svelte) and [registration controls](../../../src/lib/components/registration-controls.svelte) repeat hydration gating, pending/failure/uncertain state, retaining the last confirmed query result, offline checks, reconciliation and protected-action prompting. Changes to lost-response recovery currently require editing both components. Capacity, full-state behavior, labels and response results differ and should remain explicit.

Consider only whether the shared recovery sequence warrants a smaller interface; do not replace both with a configurable universal form. [offline-updates.e2e.ts](../../../src/routes/offline-updates.e2e.ts), [participation.e2e.ts](../../../src/routes/participation.e2e.ts) and [registration.e2e.ts](../../../src/routes/registration.e2e.ts) already test observable failure/recovery and normal actions. Preserve these boundaries rather than asserting controller fields or helper calls. No dependency on ticket 06 is required unless the selected design changes its presentation.

### 4. Personal list reads fetch every Event separately

Low priority, optional architecture candidate. `listMyActivity` and `listMyEvents` in [event-authoring.ts](../../../src/lib/server/application/event-authoring.ts) select IDs and then call `getPublicEvent` per record. Each call loads full details and relations, including all Participation kinds used to calculate capacity. `discoverPublicEventsForGroup` loads all discoverable Events before filtering to one Group. The number of personal-list Event reads grows with the number of records; no latency or database bottleneck was measured.

Review the bounded list-loading responsibility only if ticket 05 finds the maintenance benefit worthwhile. Preserve authorization, sorting, history, public visibility and capacity labels through application-operation tests. Do not add assertions about exact query counts or adopt a repository-wide data-access rewrite. Small campus data makes deferral reasonable.

### 5. Event form combines several independently changing interactions

Medium priority, optional architecture candidate. [event-details-form.svelte](../../../src/lib/components/event-details-form.svelte) owns create/edit form binding, Location mode and explicit address search, selected coordinates, map rendering, client validation/focus, uncertain-save reconciliation and a Discover preview. It is 736 lines at the reviewed revision. Size alone is not the finding: Location mode/search changes and publication recovery both modify the same form owner.

The last 40 commits touch this file eight times, event-authoring application operations six times, and the root layout six times. This is a local recent-history sample, not a long-term churn metric. Recent commits already fixed preview Host images and existing-registration counts. Shared EventCard, campus-time formatting, Host conversion and parsing already avoid important duplication; keep those boundaries. Ticket 05 may assess Location selection as one bounded responsibility while retaining form ownership and server-authoritative verification. Existing authoring, Group authoring and geocoding tests protect explicit search, manual fallback, authorized hosts, coordinates and preview behavior. Do not split the form solely to reduce line count.

### 6. Map Retry reloads the containing Event form

Medium priority, functional risk found by source inspection, not reproduced in a browser. [event-map.svelte](../../../src/lib/components/event-map.svelte) invokes `window.location.reload()` for Retry map. The Event form embeds that same component for mapped Locations. A failed map followed by Retry therefore requests a full reload while the User may have unsaved Event details; the AppUpdates confirmation protects its own refresh action, not this button.

Treat any correction as a focused behavior fix, separate from optional architectural cleanup. Verify with a deterministic failed map, edited form, Retry and retained input; existing [event-maps.e2e.ts](../../../src/routes/event-maps.e2e.ts) covers map success/theme/failure but does not establish this authoring recovery journey. Ticket 05 should decide whether to include this bounded fix in ticket 07 or record a separate issue. It does not block the seed correction or plans prototype.

### 7. Starter examples remain alongside product routes

Low priority, optional deletion candidate. `src/routes/demo/` still exposes framework example pages and a separate Better Auth login/register action implementation. `src/lib/vitest-examples/` contains greeting examples and tests; [destination-placeholder.svelte](../../../src/lib/components/destination-placeholder.svelte) has no source references found by repository search. The demo auth path duplicates product authentication entry points without their shared validation flow. This is stale scope, not a demonstrated authentication vulnerability.

Review removing these examples and the unused placeholder as a bounded cleanup. Preserve `src/routes/preview/`: public-shell, image-failure, empty and loading journeys intentionally use those deterministic fixtures. Do not remove all preview routes as unused or add regression suites solely for deleted examples. Existing product auth and route checks are the relevant verification after removal.

## Coverage inventory

| Behavior                                | Existing boundary and evidence                                                                                                                                    | Meaningful follow-up                                                                                                                                                                       |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Participation and capacity              | `application/participation.spec.ts`, `registration.spec.ts`; real migrated SQLite and injected Clock; browser Participation/registration journeys                 | Preserve idempotence, final-place competition, author exclusion and failed persistence. Add new plan behavior only for ticket 06.                                                          |
| Creator management and lifecycle        | `event-authoring.spec.ts`, `group-event-authoring.spec.ts`, `event-lifecycle.spec.ts`; browser personal/Group authoring and lifecycle suites                      | Preserve managers versus acting authors, immutable host, Participation locks, exact-end history and cancellation. Add exact-start plan behavior.                                           |
| Group rules                             | `groups.spec.ts`, `group-transactions.spec.ts`, Group management/follow browser suites                                                                            | Preserve Unicode uniqueness and transactional ownership; file-backed concurrent connection tests already exist.                                                                            |
| Discovery and shared Event presentation | `events.spec.ts`, `event-discovery.spec.ts`, public Events/Groups, filtering and core journeys                                                                    | Preserve filter semantics, Host images, dates, capacity labels and public visibility if loading changes. No need for tests of component arrangement.                                       |
| Location authoring                      | `geocoding.spec.ts`, authoring browser journeys, deterministic provider at `scripts/testing/geocoding-provider.ts`                                                | Add map Retry with an edited form if corrected. Keep tests independent of live geocoding or maps.                                                                                          |
| Theme and maps                          | `public-shell.e2e.ts` tests first paint and persisted/system modes; `event-maps.e2e.ts` supplies deterministic map responses                                      | Retain marker, attribution, dark/light styles and failure handling. No theme-controller unit suite needed.                                                                                 |
| Installation, offline and updates       | public-shell and offline-update browser suites; `e2e/updates/pwa.spec.ts` runs two releases at one origin with real workers                                       | Preserve pre-hydration edits, custom Tags edits, dismissal, no replay and other-tab preservation. Ticket 02 records user-reported Android/iPhone results with incomplete version metadata. |
| Layout, keyboard and accessibility      | `core-quality.e2e.ts` checks core routes and banners across both themes and three accepted dimensions; shell/account/authoring suites add focus and bounds checks | Extend to revised plans and navigation in ticket 06. Do not treat dimensions as proof of physical keyboard/safe-area behavior or Chromium as Firefox evidence.                             |
| Seed and fixtures                       | `seed.spec.ts`, `testing/database.spec.ts`; `createTestDatabase` uses migrated in-memory SQLite with disposal, `createTestClock` supports exact instants          | Missing edit-preservation cases belong to ticket 04. Explicit refresh behavior belongs to ticket 09.                                                                                       |
| Initialization and security             | `db/index.spec.ts`, `db/migrate.spec.ts`, authentication logging tests and `core-security.e2e.ts`                                                                 | Retain lazy runtime DB/auth initialization and payload-free diagnostics; no need to test arbitrary internal helper shapes.                                                                 |

These are inspected test responsibilities, not a coverage percentage or proof that every branch is exercised. [playwright.config.ts](../../../playwright.config.ts) creates a temporary database and seeds accounts for built-app journeys. Ordinary journeys block service workers so request mocks remain deterministic; dedicated offline and [two-build update configuration](../../../playwright.updates.config.ts) allow real workers. Reuse those setups rather than introducing another harness.

## Areas that do not currently justify cleanup

Theme selection delegates persistence and first-paint behavior to ModeWatcher. Connectivity, updates and installation already have separate context objects, with a shared banner presentation. The root layout initializes them and cleans up viewport listeners. No evidence here warrants combining them or replacing the PWA mechanism. EventCard is already shared by discovery, personal lists and the authoring preview; similar list markup alone is insufficient reason for another generic component.

## Handoff and dependencies

Ticket 05 can now compare three bounded architecture candidates: Participation recovery duplication, Location-selection responsibility within Event authoring, and repeated Event list loading. Starter deletion is a small optional cleanup. These are candidates, not selected implementations. Record the accepted scope before ticket 07. Consider the map Retry risk separately as a behavior correction with a targeted test.

Existing dependencies remain sufficient: 05 follows this audit, 07 follows 05, 09 follows 04/08, and integration ticket 10 follows the implemented polish. No new mandatory edge was established. Coordinate any selected form cleanup with ongoing authoring changes; no broad freeze is warranted. Ticket 04 is the next lowest-numbered eligible task.

Preserve [ADR 0001](../../adr/0001-lazy-runtime-initialization.md): lazy `getDb()`/`getAuth()` and the build-time auth bypass. Preserve [ADR 0002](../../adr/0002-unicode-group-name-uniqueness.md): shared NFC/lowercase Group keys and database uniqueness for every writer, including seeds and fixtures. None of the candidates requires changing these policies, persisted Event statuses, capacity rules or Creator permissions.
