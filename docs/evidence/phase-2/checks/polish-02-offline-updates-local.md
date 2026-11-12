# Offline recovery and safe updates: local evidence

Date: 2026-11-06. Branch: `feat/offline-recovery-safe-updates`. Implementation starts after `eeb3b0e`.

## Approved interaction

Leo approved the final prototype before implementation. Its primary source remains on `chore/prototype-offline-updates` at `eeb3b0e`, in `src/lib/prototypes/offline-updates.prototype.html`.

Loaded pages and entered form text remain visible on connectivity loss. An icon accompanies the offline notice and failed-action messages. Reconnection shows Back online for four seconds without navigation or submission. Failed page loads offer Retry at the originally requested URL. The update banner shares the install banner component, takes priority over installation promotion, offers Refresh and close, and has no Account entry. Close postpones the prompt for the current document session. A new app session can show a pending update again. Refresh confirms before discarding edited forms. Other tabs never reload automatically.

## Implementation boundaries

- SvelteKit bundles and registers a module service worker. It caches immutable build assets and an embedded, self-contained offline page. Application HTML, remote queries, API responses, mutations, images and map tiles are not cached by the worker.
- Build assets from earlier releases remain available while old documents may still import them. A natural activation with no open window clients removes older Campus Connect shell caches. Explicit activation while tabs remain open preserves those caches. Browser storage eviction can still remove assets.
- Online/offline browser events drive notices. They indicate connectivity, not guaranteed server availability. Transport failures remain explicit even when the browser reports online.
- Offline form submission is blocked before the form handler runs. Interest and registration controls also guard offline button actions. An unconfirmed Participation mutation disables further changes until Check current state succeeds. A failed check retains the last confirmed state and remains retryable. No action is queued or automatically repeated. Unconfirmed Event publication also blocks another submission until Check saved Events reads current server state. Matching title, start time and host produce a Review saved Event link instead of another publication; no match permits an explicit retry. This conservative match is a review aid, not a new exactly-once publication guarantee.
- The waiting worker activates only after Refresh. Only the requesting document reloads. Checks run on app startup, reconnection, foregrounding and a one-minute interval while visible. SvelteKit version detection also exposes releases through its existing update state.
- Form changes are tracked in memory. Event Tag changes explicitly mark the form edited because their custom checkbox does not emit native input/change events. Draft persistence across refresh is not promised. No database schema, dependencies, production deployment or live-data operation was added.

## Automated verification

The existing built-application Playwright boundary is the agreed seam. All fixtures use disposable data.

`src/routes/offline-updates.e2e.ts` covers retained form input, blocked offline submission, the four-second reconnect notice, failed client navigation, a real worker's document fallback, Retry preserving a query string, and lost interest/registration responses. The Participation tests let the server apply the change and drop its response, fail the first reconciliation read, then verify a successful check without a second mutation. They remove their Participation afterward.

`bun run test:updates` builds two candidates sequentially with distinct SvelteKit versions, copies their Node outputs into a temporary directory, and serves them behind one local origin on ports 4193–4195. It uses a temporary SQLite database, synthetic form text and a test-only auth secret. The candidates and database are removed afterward. It exercises a waiting release during form entry, dismissal, a new session, cancelled confirmation, explicit activation, an unchanged second tab, offline refresh protection, and update-banner bounds/accessibility in both themes at 360×800, 768×1024 and 1440×900.

Focused offline/recovery tests, 16 personal/Group authoring journeys and the initial two-build update journey passed. The publication test confirms that a committed Event whose response is lost is offered for review without a second publication. A Tags-only update journey covers the custom-control dirty-tracking fix. The complete quality result and final review outcomes are recorded below.

## Physical-device delivery confirmation, 2026-11-12

Leo reported that all requested installed-app offline/recovery and upgrade checks passed on Pixel 7 Pro with Chrome and an iPhone with Safari. The iPhone model is uncertain, possibly iPhone 15. The report covers offline notices and retained form text, fallback/Retry, reconnection without automatic submission or reload, dismissing an update without losing edits, and explicit refresh with discard confirmation and no reinstall.

OS/browser versions, candidate A/B revisions and the candidate URL were not supplied. These are user-reported results, not independently observed device tests. Ticket 02 is completed on this behavioral confirmation; the earlier pending-delivery notes below describe the state before this report.

## Earlier delivery requirements

Physical Android Chrome and iPhone Safari offline/recovery and existing-installation upgrades remain unverified and are not waived. Local Chromium tabs do not establish those installed-device results.

For each platform, record device, OS/browser versions, candidate A/B revisions, offline launch/navigation and Retry, reconnection feedback, an update during form entry, dismissal, explicit refresh without reinstalling, and preservation of another open form where the platform supports it. Use an isolated HTTPS candidate. No candidate deployment or production operation is authorized by this record.

Final Railway verification and submission captures remain with original tickets 21 and 22. This record is local development evidence.

## References

- [Owning ticket](../../../.work/04-phase-2-polish/tasks/02-deliver-offline-recovery-and-safe-updates.md)
- [Acceptance-to-evidence matrix](../../../.work/01-phase-2-campus-connect/acceptance-evidence.md)
- [SvelteKit service workers](https://svelte.dev/docs/kit/service-workers)
- [Service worker lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)

## Review corrections

The initial Standards and Spec reviews both identified the custom Tag dirty-tracking gap. The Spec review also identified the unconfirmed-publication retry risk. Both received focused browser reproductions before correction.

## Standards

Follow-up review of `ca11926` found no unresolved documented standards or correctness findings. The Tag checkbox explicitly marks the form dirty, and a two-build browser journey verifies confirmation before a Tags-only edit can be discarded. The lazy-runtime and Unicode uniqueness ADRs remain intact.

## Spec

Follow-up review of `ca11926` found no remaining implementation findings. Uncertain publication preserves the draft, requires a saved-Event check, and offers a matching Event for review. The lost-response journey verifies one mutation and one saved Event. Physical Android/iPhone upgrade delivery remains unverified and unwaived.

Review totals: Standards 0 unresolved; Spec 0 unresolved implementation findings.

## PR review follow-up, 2026-11-07

Greptile identified a missed case: a User finishes typing and blurs a server-rendered form field before hydration. Neither event reaches the update controller, and the initial navigation reset previously erased any early dirty state. The two-build browser reproduction failed because Refresh reloaded immediately without confirmation. Leaving the field focused had hidden this bug by emitting a later change event when Refresh was clicked.

The controller now compares editable native fields with their defaults when mounting, and the initial `enter` navigation preserves that result. Later navigations still clear the old form's dirty state. No field contents are stored by the update controller. The new journey holds client scripts during typing and blur, verifies the confirmation and retained text, then verifies that navigating away permits refresh without an obsolete warning. Typechecking and all three real two-build upgrade journeys passed.

GitHub CI now starts after the billing issue was resolved, but its interest-failure journey intermittently misses the expected uncertainty message. That separate CI failure remains under investigation; this follow-up does not claim CI is green.

## CI request-interception follow-up, 2026-11-07

The CI browser failure was reproduced locally once in 36 repetitions. Counting intercepted commands showed zero calls to the simulated 500 handler, while the visible Event interest control reported Interest saved and offered Withdraw interest. The real request succeeded; the test had not exercised its intended failure path. This is separate from Greptile's early-edit protection finding.

Ordinary Playwright journeys now block service workers to isolate request mocks from worker activation/network ownership. The real offline-fallback journey and the two-build upgrade configuration explicitly allow workers. No offline or upgrade assertions were removed, and no application behavior was changed for this CI correction. The failing test also asserts that its handler intercepted exactly one command and checks the interest region's actual text, so any future fixture miss is reported directly.

All 60 repetitions passed with this isolation in place. Complete `CI=1 vp run quality` then passed: formatting/lint, Svelte/TypeScript and worker typechecking, 183 unit/integration tests, all 137 browser journeys, all three real two-build upgrade journeys, and the production build. [Playwright's network guidance](https://playwright.dev/docs/network#missing-network-events-and-service-workers) documents the request-mocking/service-worker boundary.

The already-pushed Greptile-only revision `0d0460b` independently demonstrated the intermittent behavior on GitHub: its [push run passed](https://github.com/RafyTime/campus-connect/actions/runs/42419016862), while its [PR run failed the same interest assertion at 1440px](https://github.com/RafyTime/campus-connect/actions/runs/42419023502). The separate request-mocking correction is locally verified; remote confirmation follows its push. No physical-device delivery gap has been waived.

## Complete quality result

`bun run quality` passed with `CI=1`, using the repository's configured two Playwright workers. The verified application source is `ca11926`; the final record also includes a test-only hydration wait and README command documentation.

- Formatting, Oxlint, Svelte-aware ESLint, Svelte/TypeScript and the worker's TypeScript check passed with no errors.
- All 183 unit/integration tests passed across 18 files.
- All 137 built-application browser journeys passed.
- Both isolated two-build upgrade journeys passed, including Tags-only edits, offline refresh protection, other-tab preservation and both-theme bounds/accessibility at the three accepted sizes.
- The production Node build, including the module service worker, passed. The existing large map-renderer chunk warning remains.

Browser verification used Playwright Chromium revision 1248, Chrome for Testing 156.0.8078.4, on Windows. A full six-worker run exposed an existing authorization test mutating a native select before hydration; the test now waits for enabled live Tag controls before injecting its forged option. The authorization assertions are unchanged. Final quality passed with the configured CI concurrency.

Updated local Markdown links and the final diff were checked. The test fixtures retain no real credentials or private application payloads. No push, PR, candidate deployment, production deployment or live-data change occurred. The owning ticket stays ready for its unwaived physical-device delivery requirement.
