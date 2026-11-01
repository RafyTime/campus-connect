# Campus Connect Phase 2 polish

Status: ready

Category: enhancement

## Problem Statement

Campus Connect's committed Phase 2 core works, but the interface does not yet make the User's next steps and commitments clear enough. Registrations, interests and historical Events appear together, while navigation between exploration, personal Participation and Creator management feels confusing. A User should be able to understand what they are actually registered for, what is next and what has ended or been cancelled without interpreting a mixed grid of similar cards.

The application also lacks usable dark-mode controls and an installable mobile experience. Existing responsive browser checks do not establish correct standalone behavior, safe-area handling, on-screen keyboard behavior, offline recovery or updates to an installed application.

The codebase needs a bounded quality review before further cleanup. The public seed contains approximate campus Locations and test-oriented content, and rerunning it can overwrite Event details and replace memberships on seeded Groups. The final demonstration should contain credible campus content and preserve manual changes during ordinary setup.

These are finishing requirements for the existing Phase 2 application. The work must retain the completed journeys and server-enforced domain rules, keep implementation choices reviewable through the agreed workflows, and finish before final release and submission evidence capture.

## Solution

Make Campus Connect clearer and more comfortable to use through focused Participation presentation and navigation improvements, complete light/dark theme behavior, a bounded online PWA experience, selected code cleanup and a credible, safely seeded demonstration dataset.

Confirmed plans take priority, interests remain visibly distinct, and ended/cancelled Events remain accessible without crowding current plans. Prototypes determine the screen structure and visual treatment. The application follows the device's theme by default and offers a saved device preference. Mobile Users can install and launch the application, recover clearly from lost connectivity and receive updates without a forced reload during form entry.

Execution priority, revised and approved on 2026-11-01, is dark mode, PWA installation/standalone use, then offline recovery and safe updates before the remaining polish work. The general quality audit and current-state/test-coverage inventory remain directly startable, but no longer take first execution priority. Prioritize independent work without inventing dependencies on unrelated design decisions. UI/UX implementation requires its prototype first; cleanup requires the quality audit and architecture workflow; final demonstration content requires its own short grilling session. Preserve the existing release, evidence, presentation and submission sequence.

## User Stories

1. As an Explorer, I want my confirmed registrations to receive priority, so that I can quickly see the Events I have reserved places for.
2. As an Explorer, I want ongoing registered Events to be prominent, so that I can recognize what is happening now.
3. As an Explorer, I want upcoming registrations ordered soonest first, so that I can understand what is next.
4. As an Explorer, I want interests to be clearly distinguished from registrations, so that considering an Event does not look like having a reserved place.
5. As an Explorer, I want my retained Participation in ended Events to remain accessible, so that I can review past plans.
6. As an Explorer, I want a cancelled Event to be clearly labelled, so that I do not mistake it for a current plan.
7. As an Explorer, I want historical Events to be less prominent than current plans, so that old content does not obscure what matters now.
8. As an Explorer, I want an Event to change from upcoming to ongoing and then ended at the correct times, so that its presentation matches its schedule.
9. As an Explorer, I want cancellation to take precedence over time-based presentation, so that a cancelled Event never looks ongoing or upcoming.
10. As an Explorer, I want cancelling registration or withdrawing interest to remove that Participation from my personal view, so that the interface reflects my current choices.
11. As an Explorer, I want a past registration to be described accurately, so that the application does not claim I attended an Event merely because I registered.
12. As a User, I want clear navigation between discovery, my plans and managing published content, so that I can reach the right task without deciphering similar labels.
13. As a Creator, I want reorganized navigation to retain my Event-management capabilities and permissions, so that clearer presentation does not remove working functionality.
14. As a Visitor, I want public discovery and protected-action prompts to remain understandable, so that I can explore before deciding to register.
15. As a User, I want coherent empty, loading, validation and failure states in the revised interface, so that I know what happened and what I can do next.
16. As a keyboard User, I want predictable focus order and visible focus across the revised interface, so that I can complete the same journeys without a pointer.
17. As a mobile User, I want navigation, forms, dialogs and filter sheets to fit my screen, so that controls remain readable and reachable.
18. As a User, I want the application to follow my device's color theme initially, so that it matches my preferred viewing conditions.
19. As a User, I want System, Light and Dark appearance options, so that I can choose how this device displays the application.
20. As a User, I want my appearance choice to persist on this device, so that it survives navigation, reloads and later visits.
21. As a User, I want the correct theme applied before the page becomes visible, so that I do not see a flash of the wrong theme.
22. As a User, I want forms, dialogs, focus indicators and browser controls to remain usable in both themes, so that dark mode covers the full interaction.
23. As an Explorer, I want mapped Locations to use the corresponding light or dark map style, so that maps fit the chosen theme.
24. As an Explorer, I want maps to retain their clear marker, scale and attribution in either theme, so that appearance changes preserve the accepted map behavior.
25. As an Android User, I want to install Campus Connect from Chrome with recognizable identity and icons, so that I can launch it from my device.
26. As an iPhone User, I want to install and launch Campus Connect through Safari's home-screen flow, so that it works as an installed mobile application.
27. As an installed-app User, I want a standalone launch experience, so that the application feels coherent outside a normal browser tab.
28. As a mobile User, I want safe areas and the home indicator accommodated, so that application controls do not collide with device UI.
29. As a mobile User, I want forms and filter sheets to remain usable when the on-screen keyboard opens, so that I can complete input without losing essential controls.
30. As a User with lost connectivity, I want a useful offline screen and retry action, so that I understand the limitation and can recover.
31. As an Explorer, I want Event actions to require a successful online result, so that an offline interaction does not imply a confirmed registration or changed Participation.
32. As an installed-app User, I want a clear refresh action when an update is available, so that I can choose when to load the new version.
33. As a User entering a form, I want updates to avoid forcing a reload, so that a release does not unexpectedly interrupt my work.
34. As an installed-app User, I want to receive a new release without reinstalling, so that the application stays practical to maintain.
35. As a desktop User, I want the polished application to continue working in Firefox, so that mobile improvements preserve the supported browser journey.
36. As a maintainer, I want the general quality audit to start without waiting for prototypes or content planning, so that actionable evidence is gathered immediately.
37. As a maintainer, I want duplication, confusing responsibilities, stale code and inconsistent components identified with concrete evidence, so that cleanup targets real friction.
38. As a maintainer, I want architecture candidates reviewed through the agreed skill before implementation, so that consequential refactors have a clear purpose and design.
39. As a maintainer, I want cleanup limited to selected findings, so that the finishing pass does not become an architectural rewrite.
40. As a maintainer, I want existing behavioral tests preserved where they express valid requirements, so that refactoring does not weaken confidence in working journeys.
41. As a maintainer, I want tests to use existing public testing boundaries, so that verification does not require exposing implementation details.
42. As a Visitor, I want credible campus Groups and Event examples, so that the demonstration communicates a believable campus use case.
43. As an Explorer, I want real Locations and verified coordinates, so that map markers correspond to the places described.
44. As a User, I want illustrative Events distinguishable from verified real occurrences, so that demonstration content does not misrepresent the campus schedule.
45. As a maintainer, I want the final Groups, Events and Locations agreed in a short content-grilling session, so that the dataset reflects deliberate choices.
46. As a presentation author, I want realistic examples of interest, registration, full capacity, cancelled Events and ended Events, so that the accepted behaviors can be demonstrated clearly.
47. As a Visitor, I want the public demonstration free of deliberately broken images and script-safety test text, so that the application appears finished.
48. As a maintainer, I want adversarial examples retained in disposable automated fixtures, so that cleaning the public demonstration does not remove failure and security coverage.
49. As a maintainer, I want repeated routine seeding to establish missing demonstration data safely, so that setup remains reproducible without resetting manual work.
50. As a User, I want my content, manual edits, Group subscriptions and Participation preserved during routine seeding, so that maintenance does not silently undo my choices.
51. As a maintainer, I want date refreshes and demonstration resets to be explicit and documented, so that their effects are deliberate and reviewable.
52. As a maintainer, I want work ordered by actual dependencies, so that independent implementation is not delayed by unrelated planning while required reviews still happen first.
53. As a reviewer, I want UI/UX changes prototyped before implementation, so that behavior and visual decisions can be reviewed before production code changes.
54. As a release owner, I want polish finished and verified before the final release and captures, so that the repository, deployed application and submission evidence agree.

## Implementation Decisions

### Product and domain behavior

- Preserve the completed Phase 2 discovery, authentication, Group, publication, authorization, capacity and retained-history rules. Reorganize their presentation without silently changing permissions or Participation behavior.
- Prioritize ongoing registered Events, then upcoming registrations ordered by start time. Distinguish interests visibly. Keep retained Participation in ended/cancelled Events accessible with less prominence than current plans.
- Upcoming means the start time has not been reached. Ongoing means start time has been reached and end time has not. Ended begins at the end time. Cancellation takes precedence over these time-based distinctions.
- Derive the presentation from existing times and lifecycle state; no new persisted lifecycle status or attendance-tracking schema is required by this decision.
- Creator cancellation preserves Event details and relevant Participation. Cancelling registration or withdrawing interest removes that Participation from personal activity. Do not add personal withdrawal history or describe registration as proof of attendance.
- Modify the existing personal Participation presentation, Creator-management presentation, shared Event information hierarchy and application navigation as selected through prototypes. The existing labels and destination arrangement may change; discovering content, reviewing plans and managing published content remain available.
- Exact layouts, navigation labels, grouping controls and empty-state presentation are prototype decisions, not prescribed by this specification.

### Theme and maps

- Extend existing theme tokens and application-shell behavior with System, Light and Dark preferences. Default to the device setting and persist an explicit preference on the device. Account synchronization is not required.
- Resolve and apply the effective theme before initial paint. Cover navigation, forms, dialogs, focus indicators and browser controls in both themes.
- Retain the current light Positron map style and use its dark counterpart when dark mode is effective. Verify the actual provider style identifier during prototyping rather than inventing a URL or applying an unrelated style.
- Preserve zoom level 16, one centered Location marker, attribution and the accepted non-interactive map behavior. Do not introduce pan, zoom, directions, dragging or coordinate editing as part of theme support.
- The theme-aware map presentation supplements the earlier light-style decision; it does not reopen the map interaction design or replace the renderer as an incidental cleanup.

### PWA and mobile experience

- Add the application identity, install metadata and icon assets needed for Android Chrome and iPhone Safari installation and standalone launch. Preserve normal desktop Firefox use; desktop installation is not a separate release requirement.
- Keep the PWA scope online. Provide a clear offline fallback and retry path. Offline Event data workflows, offline registration, queued mutations, push notifications and offline maps are excluded.
- Apply PWA best practices within that bounded scope. Validate installed-mode navigation, safe areas, the home indicator, keyboard-open forms and filter sheets. Browser viewport tests alone do not prove installed-device behavior.
- Offer a clear refresh action when an update is available. Do not force a reload during form entry. An existing installation must be able to receive a release without reinstalling.
- Choose the concrete install, offline and update mechanisms during implementation design. Do not select a new framework, caching library or broad offline architecture merely because the application gains a manifest or service worker.

### Quality and architecture workflow

- Begin with a general code-quality audit covering duplication, confusing responsibilities, stale code and inconsistent components. Record concrete affected behavior, evidence and likely scope; do not treat a list of speculative refactors as mandatory work.
- Prefer recently changed or repeatedly touched areas and the agreed product concerns when selecting audit scope. Existing Participation views, shared Event presentation, navigation, theme handling and shared seed helpers are known areas to inspect, not preselected refactors.
- After the general audit, run `improve-codebase-architecture` and follow its architecture exploration, candidate report and design discussion before implementing selected cleanup.
- Keep cleanup bounded to selected findings. Preserve existing behavior unless this specification explicitly changes it. If cleanup affects UI/UX, both the architecture and prototype prerequisites apply.
- Respect the existing lazy runtime database/authentication decision and Unicode Group-name uniqueness policy. No agreed requirement currently calls for replacing either decision.
- Do not add speculative modules, storage or test interfaces just to anticipate later work. Select any necessary changes through the applicable review workflow.

### Demonstration data and seed safety

- Begin final content selection with a short grilling session covering the Groups, Events, Locations, sources for real-world claims and expected demonstration states. The actual final catalog remains delegated to that task.
- Use accurate campus Locations and verified coordinates; verify real Group details where used. Distinguish representative demonstration Events from verified real occurrences. Do not manufacture a current real campus schedule.
- Keep realistic examples of interest, registration, full capacity, cancelled Events and ended Events in the agreed demonstration. Remove deliberately missing images and literal HTML/script safety content from public demonstration data, while retaining those cases in automated fixtures.
- Routine seeding must preserve manually created content, manual edits, Group subscriptions and Participation while safely establishing the agreed dataset on repeated runs. Stable identifiers alone do not establish preservation.
- Make any demonstration date/content refresh or state reset a deliberate, explicit operation with affected records and effects documented. Choose the mechanism in implementation design; do not make routine setup an implicit reset.
- Review the public seed and shared fixture helpers together. Current helpers overwrite existing Event content/dates and replace memberships on seeded Groups. Public-seed preservation must improve without preventing disposable test fixtures from deliberately resetting their isolated data.
- Do not introduce a seed-related migration or management interface unless implementation demonstrates a concrete need. No schema design for seed ownership or refresh tracking has been selected.

### Priority and dependencies

- **First execution priority: dark mode and PWA.** Deliver theme preferences/maps, installation/standalone handling, then offline recovery and safe updates before the remaining work. This later user decision supersedes the earlier audit-first preference. Preserve the required prototype before each UI/UX implementation.
- **Directly startable evidence work.** The general quality audit and current-state/test-coverage inventory require no prior grilling session, prototype or architecture selection. They retain no technical blockers; execution priority alone is not a blocking edge.
- **Next: independent prerequisite workflows.** Once audit findings are available, run the required architecture workflow for cleanup. UI/UX prototyping and the short seed-content grilling session can proceed independently where neither depends on an unsettled audit finding. Do not create a single unnecessary dependency chain across all three.
- **Cleanup implementation** depends on the general audit and the selected architecture/design outcome. Any UI/UX effect also depends on its prototype.
- **UI/UX implementation**, including theme controls and user-facing PWA/offline/update behavior, depends on the relevant prototype. Backend preparation must not pre-empt an unresolved user-facing behavior decision.
- **Seed-preservation behavior and fixture separation** are independent of selecting the final campus names, dates and coordinates. Work on those established behavioral requirements as soon as their applicable review prerequisites are satisfied; final catalog selection must not become an artificial blocker. Refactoring shared helpers still follows the cleanup workflow where applicable.
- **Final demonstration content** depends on the short content-grilling session. Final dataset application depends on the preservation/explicit-refresh behavior needed to apply it safely.
- **Integration and release verification** follow all selected polish implementations and the final dataset. They must include any geocoding behavior shipped through the original ticket 18. Do not block the initial audit on geocoding, and do not duplicate geocoding implementation in this workstream.
- **Release handoff** requires all resulting polish tasks to be resolved before original ticket 21. Keep the existing ticket sequence for final release, evidence capture, presentation and submission. The published tickets encode actual dependencies and the approved dark-mode/PWA-first priority. Later directly startable work is not falsely blocked by those priorities.

## Testing Decisions

- Leo confirmed the testing seams during the `to-spec` synthesis: existing Playwright browser journeys are the primary boundary; focused existing server-operation and seed tests cover invariants that are clearer below the browser; Android/iPhone installed behavior and desktop Firefox receive manual verification. No new internal test interface is selected.
- Prefer observable behavior through the highest existing boundary. Verify what a User sees, can reach and can change; avoid assertions about internal component structure, CSS-class strings, helper-call sequences or a refactor's exact arrangement.
- Extend existing built-application Playwright journeys for public discovery, authenticated Exploration, personal Event publication and Group Event publication. Retain the disposable-database setup and existing account/fixture tools rather than build a parallel harness.
- Use the existing personal Participation, registration, Event lifecycle, Group follow, accounts and authoring suites as prior art. Verify that current Participation rules and Creator permissions survive the new presentation.
- Use the existing server application-operation seam and controllable clock for exact start/end boundaries, cancellation precedence and retained Participation. Test upcoming, exact start, ongoing, exact end, ended and cancelled cases, including their effect on the returned personal-plan behavior.
- Use the existing real disposable SQLite seed/fixture seam to verify repeat seeding, manual-content preservation, edits to seeded records, subscriptions and Participation, and the separately explicit refresh/reset behavior. Keep fixture-reset expectations separate from public-seed preservation expectations.
- Verify theme behavior through browser-visible results: system default, each override, persistence across reloads/navigation, a correct initial theme and usable themed controls/maps. Do not add production-only test hooks to inspect theme internals.
- Extend the existing responsive and accessibility audits at 360x800, 768x1024 and 1440x900 in both themes on the revised core screens. Retain keyboard/focus checks and the gate of no critical or serious automated accessibility violations. Check actual control bounds as well as page overflow so clipping is not hidden by CSS.
- Exercise supported install metadata, standalone-sensitive behavior, offline fallback/retry and update transitions through the existing browser boundary where automation is representative. Keep operations online and verify that an offline attempt does not present a false success. Test update availability during form entry and updating an existing installation.
- Manually verify Android Chrome and iPhone Safari installation/standalone behavior, safe areas, home-indicator spacing and keyboard-open forms/filter sheets. Retain desktop Firefox smoke checks. Record platform/browser, result and any unverified behavior; emulated dimensions alone are not proof of those installed-device checks.
- Retain map and remote-image failure coverage in deterministic fixtures. Automated tests must not depend on live campus schedules, public geocoding calls, map-provider availability or third-party image reliability.
- Run the repository's existing formatting, lint, Svelte/TypeScript, automated test and production-build quality command for completed implementation units and the exact release revision. Documentation-only synthesis receives formatting/lint and link/diff validation; it does not require new product tests.
- Audit and prototype deliverables are evaluated against their evidence and agreed outcomes, not artificial unit tests for documents or visual experiments. Preserve focused behavioral tests rather than add redundant smoke suites for unchanged functionality.
- After implementation, update the existing acceptance-to-evidence matrix and final-release records with the resulting behaviors, checks and required captures. Local tests and prototypes do not become final Railway submission media.

## Out of Scope

- Treating specification or ticket publication as execution of the product changes, cleanup audit, prototypes or content-grilling session.
- A general architectural rewrite, automatic adoption of every audit suggestion, replacement of the toolchain, authentication system, database or map renderer without a separately justified decision.
- Account-synchronized theme preferences.
- Attendance tracking, retained personal history for withdrawn interest/cancelled registration, a new persisted ongoing/ended status, or changes to existing capacity/authorization rules.
- Offline Event browsing workflows, offline Participation, background mutation queues, push notifications and offline maps.
- Desktop PWA installation as an additional release gate.
- Map interaction features beyond the accepted non-interactive Location display.
- Selecting the final campus catalog during specification synthesis, presenting invented Events as verified real occurrences, or using production as a disposable test database.
- Implementing Nominatim geocoding in this workstream; original ticket 18 owns it.
- Subscriber-only Events and the Group updates/Notifications package; their Phase 2 deferrals remain owned by the original stretch-decision workflow.
- Duplicating the existing final-release, final-evidence, presentation, recording or submission tickets.
- Committing, pushing, opening pull requests, deploying or changing live data through this specification pass.

## Further Notes

- This specification was synthesized from the completed grilling session and Leo's shared-understanding confirmation on 2026-11-01. The testing seams were then explicitly confirmed during `to-spec`.
- The local issue tracker maps `ready-for-agent` to `Status: ready`; this specification uses that local vocabulary. Leo subsequently supplied the ticket skill and approved publication; the [ticket index](README.md) records the execution order and blocking edges.
- Parent scope: [original Campus Connect Phase 2 specification](../01-phase-2-campus-connect/phase-2-spec.md). This additive specification preserves that workstream's structure and completed tickets. It clarifies Participation presentation, adds theme-aware map styling and establishes the new polish/PWA/seed requirements without rewriting the parent specification.
- Geocoding remains in [original ticket 18](../01-phase-2-campus-connect/tasks/18-add-nominatim-geocoding.md). Record formal stretch outcomes and corresponding deferrals through [original ticket 16](../01-phase-2-campus-connect/tasks/16-deploy-core-and-decide-stretches.md); this synthesis does not itself change those ticket statuses.
- Integration point: [original ticket 21: final release and repository documentation](../01-phase-2-campus-connect/tasks/21-finalize-release-and-repository-docs.md). The ticket workflow must make it depend on the new polish work and the existing stretch outcomes.
- Preserve the remaining sequence: [ticket 22: final evidence](../01-phase-2-campus-connect/tasks/22-capture-final-evidence.md), [ticket 23: presentation](../01-phase-2-campus-connect/tasks/23-build-phase-2-presentation.md), and [ticket 24: recording and submission](../01-phase-2-campus-connect/tasks/24-record-and-verify-submission.md).
- The [domain glossary](../../../GLOSSARY.md) distinguishes Upcoming, Ongoing, Ended and Cancelled Events and clarifies Registration as a reservation rather than attendance. Preserve [lazy runtime database/authentication initialization](../../adr/0001-lazy-runtime-initialization.md) and [Unicode Group-name uniqueness](../../adr/0002-unicode-group-name-uniqueness.md). No new ADR was warranted by the reversible presentation and workflow decisions made here.
- Final interface structure belongs to the required prototypes. Selected cleanup design belongs to the audit/architecture workflow. Exact Groups, Events, Locations and source records belong to the later short seed-content grilling session. These are deliberate task prerequisites, not unresolved product-scope questions requiring another interview before publication.
- Prototypes, fixtures and local verification use isolated artifacts or disposable data. Any later live deployment, seed refresh/reset or database change must identify its target and follow Leo's production-authorization and release rules. No production operation is authorized merely by marking this specification ready.
