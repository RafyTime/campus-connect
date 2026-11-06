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

Focused offline/recovery tests, 16 personal/Group authoring journeys and the initial two-build update journey passed. The publication test confirms that a committed Event whose response is lost is offered for review without a second publication. A Tags-only update journey covers the custom-control dirty-tracking fix. Final full-quality and review results are recorded below when complete.

## Delivery still required

Physical Android Chrome and iPhone Safari offline/recovery and existing-installation upgrades remain unverified and are not waived. Local Chromium tabs do not establish those installed-device results.

For each platform, record device, OS/browser versions, candidate A/B revisions, offline launch/navigation and Retry, reconnection feedback, an update during form entry, dismissal, explicit refresh without reinstalling, and preservation of another open form where the platform supports it. Use an isolated HTTPS candidate. No candidate deployment or production operation is authorized by this record.

Final Railway verification and submission captures remain with original tickets 21 and 22. This record is local development evidence.

## References

- [Owning ticket](../../../.work/04-phase-2-polish/tasks/02-deliver-offline-recovery-and-safe-updates.md)
- [Acceptance-to-evidence matrix](../../../.work/01-phase-2-campus-connect/acceptance-evidence.md)
- [SvelteKit service workers](https://svelte.dev/docs/kit/service-workers)
- [Service worker lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)

## Review corrections

The initial Standards and Spec reviews both identified the custom Tag dirty-tracking gap. The Spec review also identified the unconfirmed-publication retry risk. Both received focused browser reproductions before correction. Final review and quality outcomes follow below.
