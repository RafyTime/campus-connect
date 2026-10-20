# Ticket 12: limited Event registration

Local implementation verification on 2026-10-20, Europe/Budapest. Railway checks and final submission captures remain planned.

## Delivered behavior

Authenticated Explorers can register for scheduled public registration Events and cancel their registration. A SQLite immediate write transaction holds the capacity check and insertion under one write lock. A retry returns the existing confirmation even when the Event is full. Cancellation is idempotent and frees a place. Visitors, authors, wrong response modes, missing Events, cancelled Events and ended Events cannot mutate registration. Full capacity returns an explicit recoverable result. Database failures leave the previous state intact.

Event details and Discover compute remaining places from confirmed registrations. Registration controls show capacity, confirmed and remaining places, the current User's confirmation, pending protection, authentication prompts, full/unavailable states and retryable failures. My activity distinguishes registrations from interests and retains cancelled and ended Event history.

The accumulated seed keeps Statistics study group available, Sunday campus run nearly full with Jonas confirmed, Small campus workshop full, and Cancelled campus workshop as Jonas's retained registration history. Stable keys make repeated seeding idempotent. Existing interest examples and Mira's empty activity remain available. No table migration is required; the existing Participation table already supports registration.

## Automated evidence

- `src/lib/server/application/registration.spec.ts`: successful registration and cancellation, repeated operations, simultaneous final-place attempts, explicit full result, response modes, visitor and author exclusion, database failure rollback, updated public capacity labels, mixed interest/registration activity, retained cancelled/ended history, User isolation, Group member participation and seed idempotency.
- `src/lib/server/seed.spec.ts`: accumulated seed stability and expected discovery content.
- `src/routes/registration.e2e.ts`: registration, persistence, My activity, cancellation, pending and duplicate clicks, network failure recovery, visitor prompts, full and cancelled states, stale final-place attempt and recovery after cancellation. Checks 360, 768 and 1440 pixel widths, horizontal overflow and serious/critical accessibility violations.
- Existing interest tests continue to verify the shared Participation and My activity behavior. Application and browser runners apply migrations to fresh disposable databases.

## Quality and review

Formatting, lint, Svelte/TypeScript checks, the production build, all 169 Vitest tests, and all 82 Playwright tests passed. The seven new browser tests also passed in a focused run. Phone screenshot inspection confirmed readable capacity and registration controls without horizontal overflow. The standard sandbox blocks Chromium localhost access and Vitest fork workers cannot share temporary transform files. Use the installed Chromium path and run browser checks outside the sandbox; Vitest succeeds with `--pool=threads`.

The implement skill's Standards and Spec reviewers identified an activity badge that still said Interest for registrations; it now uses Participation kind. Registration state also explicitly filters public Events. Both reviewers confirmed the fixes and reported no remaining findings. Review baseline is `0a6376fc02ad82da106a8baf8e0f0b194691c6e3`, with changes kept uncommitted under repository instructions.

## Final Railway evidence plan

On the final Railway deployment, record the commit and date. Register for an available Event, verify remaining capacity and My activity, cancel and verify the place is available again. Use two Users with a final place to demonstrate a specific full result and an unchanged confirmation for the winner. Capture CAP-06 My activity and Event details with capacity, plus registration, full capacity and cancellation scenes for VIDEO-01. These local tests and previews are implementation checks, not final submission media.

No production service, production database or daily preview was accessed. Event mutation locks and creator cancellation remain ticket 13.
