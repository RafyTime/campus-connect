# 15: Audit committed-core quality across journeys

**What to build:** Audit the completed core as one application. Close only cross-journey inconsistencies in accessibility, responsive behavior, failure handling, security, and release checks; feature tickets remain responsible for their own acceptance work.

**Blocked by:** 06: Follow and unfollow Groups; 07: Create and edit Groups; 09: Publish public group Events; 10: Filter public Events; 13: Protect Event lifecycle and retained history; 14: Show curated Event maps.

**Status:** completed

## Acceptance criteria

- [x] Four desktop Chromium Playwright journeys pass against the built application and a disposable database: public visitor discovery, Explorer authentication plus follow and public Event Participation, personal Event publication, and public group Event publication.
- [x] Representative interactions pass at 360x800, 768x1024, and 1440x900 without horizontal page scrolling, clipped controls, or unusable dialogs, forms, maps, cards, or navigation.
- [x] Automated accessibility scans find no critical or serious violations on Discover, Event details, authentication, Event creation, Group details, My activity, or My events.
- [x] Cross-journey keyboard order, visible focus, landmarks, form labels, errors, alternative text, contrast, and non-color status cues are consistent.
- [x] Loading, empty, validation, unauthenticated, full-capacity, duplicate-action, cancelled, remote-image-failure, map-tile-failure, not-found, and general-server-failure behavior is coherent across routes.
- [x] Authorization and sensitive-data checks confirm that browser code does not decide permissions or capacity and logs contain no credentials, passwords, session tokens, or complete authentication payloads.
- [x] The release command passes with formatting, linting, Svelte and TypeScript checks, automated tests, accessibility checks, and the production build.
- [x] The audit records cross-journey fixes without moving missing feature acceptance into this ticket.
- [x] The acceptance-to-evidence matrix contains the final committed-core automated test references and planned production checks.

## Implementation tasks

- [x] Complete the four committed Playwright journeys against the built application and disposable database.
- [x] Add or consolidate responsive and accessibility audits across the named routes and viewports.
- [x] Audit shared error handling, authorization boundaries, logging, remote-image fallback, and map failure behavior.
- [x] Fix cross-journey inconsistencies found by the audit and add regression tests for each fix.
- [x] Run the release command and update the acceptance-to-evidence matrix with the final core test references and remaining production evidence needs.

## Comments

Completed locally on 2026-10-29. [Audit evidence](../../../evidence/phase-2/checks/15-committed-core-quality-local.md) records the four desktop journeys, responsive and axe audits, failure/security review, sensitive authentication logging fix, and both code-review outcomes. `vp run quality` passed: 183 unit/integration tests, 105 Playwright tests, formatting, lint, Svelte/TypeScript and production build. Production verification and final captures remain planned under tickets 16, 21 and 22. Changes remain uncommitted under the user’s instructions.
