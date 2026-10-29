# Ticket 15: Committed-core quality audit

Local audit on 2026-10-29 (Europe/Berlin), against the built application with migrated, seeded disposable SQLite databases. Baseline: `ac0f1c51497d40f73e0aee5488e2be873b7b4fb9`; changes remain uncommitted under the user's repository instructions. No production service, database, or daily preview was accessed.

## Four desktop Chromium journeys

The release suite runs these tests against the same built SvelteKit application and real server operations:

- `src/routes/core-journeys.e2e.ts`, “public visitor discovers filtered Events, opens details and explores the host Group”: choose Host and Group filters, reload the shared URL, open Event details and mapped Location, then explore its Group.
- `src/routes/core-journeys.e2e.ts`, “Explorer authenticates from a protected action, follows and joins a public Event, then reviews My activity”: register from the protected-action dialog, return without replaying the action, follow, refresh, express interest, find the persisted Participation in My activity, withdraw and unfollow. A separate Creator publishes a journey-specific Group and Event through the UI, keeping subscriber-count and Participation fixtures isolated from parallel feature tests.
- `src/routes/event-authoring.e2e.ts`, “a Creator publishes, discovers, and manages a public personal Event”: publish with Tags, registration capacity and curated Location, verify public discovery in a separate Visitor context, then manage and edit through My events.
- `src/routes/group-event-authoring.e2e.ts`, “seeded lena publishes a public Group Event that the other manager can edit”: owner publication, public discovery and Group listing, then management and editing by a representative. The same journey also runs with the representative publishing and owner editing.

All four use 1440x900 desktop viewports. Existing feature acceptance stays in its owning suites; the audit adds only the missing end-to-end composition and explicit desktop defaults.

## Accessibility, responsive behavior and keyboard consistency

`src/routes/core-quality.e2e.ts` scans Discover, mapped Event details, Group details, Sign in, Register, Event creation, My activity and My events at 360x800, 768x1024 and 1440x900. It also scans registration validation errors and the protected-action dialog. Each scan rejects serious or critical axe violations, page overflow, and horizontally clipped visible form controls and navigation. Hidden, aria-hidden form bookkeeping inputs are excluded from the visible-control bounds check.

The audit includes failed external images and map requests while keeping the real application running. `public-events.e2e.ts` and `public-groups.e2e.ts` verify image initials explicitly; `event-maps.e2e.ts` verifies map resources, marker, attribution, keyboard exit, each failure mode and retry recovery.

Keyboard evidence combines the audit's Enter-to-open and Escape-to-close dialog with focus restoration, `accounts.e2e.ts` dialog traversal, `public-shell.e2e.ts` skip link, landmarks, navigation order and visible focus, and `event-filtering.e2e.ts` keyboard filters and focus retention. Existing form suites verify labels, inline errors and correction. Axe checks contrast and alternatives; response modes, capacity, cancelled and ended states use text alongside visual styling. Automated checks do not replace the planned final manual Firefox and keyboard smoke checks.

## Failure and security audit

Reviewed the shared shell, error page, protected-action dialog, remote forms/commands, application authorization, Participation transactions, host image fallback and map lifecycle. The audit found and fixed sensitive dependency error logging. Other new coverage closes cross-journey audit gaps; it does not take ownership of missing feature acceptance.

- Loading and general failure: `public-shell.e2e.ts`; pending commands and recoverable request failures: `group-follow.e2e.ts`, `event-authoring.e2e.ts`, `participation.e2e.ts`, `registration.e2e.ts`.
- Empty, validation and unauthenticated states: public Event/Group suites, account suites, authoring suites and Participation suites. Not-found behavior: public shell, Event and Group suites.
- Full capacity, duplicate actions and cancellation: `registration.e2e.ts`, `event-lifecycle.e2e.ts` and the server `registration.spec.ts`, `participation.spec.ts`, `event-lifecycle.spec.ts`.
- Permissions originate in request-local authenticated User context and are checked again in server application operations. Group roles, author exclusion, immutable host, edit locks and atomic final-place capacity are covered by `groups.spec.ts`, `group-event-authoring.spec.ts`, `event-authoring.spec.ts`, `participation.spec.ts` and `registration.spec.ts`. Browser state supplies presentation, not authorization or admission decisions.
- `core-security.e2e.ts` checks HttpOnly session cookies and that rendered Discover, Group, Create, My activity, My events and Account responses do not disclose the authenticating email, password or session cookie. `+layout.server.ts` returns only User ID and display name through `toSessionUser`; public data queries select explicit fields. Existing account tests cover unsafe return URLs; public Event tests cover text escaping.
- Better Auth and its underlying HTTP router can log database errors containing SQL parameters, including generated session tokens. `authentication-logging.spec.ts` reproduces a failed session insert with a real disposable database and the exposed authentication handler. It failed with the raw query and session data before the fix and passes after it. The factory now accepts its real database explicitly, uses a category-only dependency logger, and routes unexpected HTTP errors through a safe 500 response before the underlying router can print them. The SvelteKit `handleError` logs only the route template for unknown failures and preserves expected framework/app/validation errors. Seed CLI output is a fixed completion message; migration diagnostics do not involve authentication payloads. Repeat restricted log inspection after deployment; local verification does not prove production access-log configuration.

## Release verification

`vp run quality` is the release gate: formatting, both linters, Svelte/TypeScript, unit/integration/component tests, built-app Playwright including axe, then production build. Final result: passed. Formatting, both linters and Svelte/TypeScript checks passed with zero diagnostics. All 183 unit/integration tests (18 files) and all 105 Playwright tests passed, including the four desktop journeys and all three cross-route axe audits. The production build passed. The existing lazy map-renderer chunk-size warning remains non-blocking. The full release output contained no known test credentials, session-token fields or raw SQL parameter dumps. The failed-session-write regression separately proves safe logging when the real authentication database operation fails.

The optional `PLAYWRIGHT_SERVER=node` mode requires an artifact built for its matching origin (`http://127.0.0.1:4183`), because this project embeds `paths.origin` at build time. Reusing a preview artifact built for port 4173 causes form-origin rejection. The standard quality command uses the matching build-and-preview runner.

## Planned production evidence

Ticket 16 owns core deployment and production smoke evidence. Verify authentication/return paths, filtering and refresh, public Event and Group details, follow counts, Participation and capacity, creator and representative authorization, mapped and plain-text Locations, failed tiles/images and mobile navigation. Inspect logs without copying credentials or session values into evidence. Record the deployed commit and date.

Ticket 21 owns final manual Firefox desktop and keyboard smoke checks. Ticket 22 owns final Railway screenshots and screencast captures, including 360x800, 768x1024 and 1440x900 representative interactions. No local screenshot is final submission media; stretch checks remain independently gated.

## Code review

Two read-only reviewers examined the working changes against the baseline above, independently checking repository standards and ticket/spec coverage.

### Standards

The initial reviewer identified a race between the new Explorer journey's Film Society follow action and existing exact subscriber-count assertions. The journey now publishes its own Group and Event through a separate Creator context. Re-review found no remaining documented-standard violations, actionable smells, or security issues; lazy initialization remains intact.

### Spec

The initial reviewer identified dependency error logging, the shared Group fixture race, and an incorrect relative matrix link. The failed-session-write regression drove the logging fix, the fixture is isolated, and the link is corrected. Re-review found all three findings resolved and no remaining actionable Spec findings.

Final review: Standards 0 unresolved findings; Spec 0 unresolved findings.
