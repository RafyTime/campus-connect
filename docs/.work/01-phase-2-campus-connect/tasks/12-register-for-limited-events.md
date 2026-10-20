# 12: Register for limited Events

**What to build:** Let an authenticated Explorer register for a public registration Event with remaining capacity, cancel that registration, and understand the remaining or full state. Capacity remains correct under concurrent requests.

**Blocked by:** 11: Express interest and use basic My activity.

**Status:** completed

## Acceptance criteria

- [x] An authenticated Explorer can register once for a scheduled public registration Event with remaining capacity.
- [x] Registration uses an atomic database operation that cannot raise confirmed registrations above capacity, including concurrent attempts for the final place.
- [x] A full attempt returns a specific recoverable result and leaves existing registrations unchanged.
- [x] The participant can cancel a registration, after which capacity becomes available again.
- [x] Repeated registration or cancellation requests return the resulting state without duplicate records or generic errors.
- [x] Event details show capacity, confirmed or remaining places, full state, and the current User's registration state.
- [x] My activity includes upcoming registrations alongside interests.
- [x] Announcement and interest Events reject registration operations, and Event authors remain excluded from Participation.
- [x] Registration controls expose pending, full, duplicate-action, cancelled-or-unavailable, and server-failure states on representative viewports.
- [x] Automated tests cover successful and cancelled registration, response-mode rules, full capacity, repeated requests, author exclusion, My activity, and concurrent final-place attempts.
- [x] The acceptance-to-evidence matrix records the tests and planned registration and capacity evidence.

## Implementation tasks

- [x] Add atomic registration and cancellation operations that enforce response mode, authorization, uniqueness, and capacity.
- [x] Extend Event details and My activity with responsive registration and capacity behavior.
- [x] Extend Participation fixtures and seed helpers for available, nearly full, full, registered, and cancelled cases.
- [x] Add server concurrency tests and browser tests for registration, capacity, cancellation, and failure results.
- [x] Update the acceptance-to-evidence matrix with test references and planned production and screencast evidence.

## Comments

Implemented on 2026-10-20. Registration and cancellation enforce public visibility, response mode, author exclusion, uniqueness and capacity inside an immediate SQLite write transaction. Event details and public discovery show remaining places from confirmed registrations. My activity distinguishes registration from interest and retains cancelled and ended history. The accumulated seed includes available, nearly full, full, confirmed and cancelled examples.

Formatting, lint, Svelte/TypeScript checks, 169 Vitest tests, 82 Playwright tests and the production build passed. Standards and Spec reviews confirmed their findings resolved. See [the local verification record](../../../evidence/phase-2/checks/12-registration-local.md) and CORE-12 in [the acceptance matrix](../acceptance-evidence.md). Final Railway checks and submission captures remain planned evidence. No production or daily preview was accessed. Changes remain uncommitted under repository instructions.
