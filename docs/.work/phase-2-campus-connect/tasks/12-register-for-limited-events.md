# 12: Register for limited Events

**What to build:** Let an authenticated Explorer register for a public registration Event with remaining capacity, cancel that registration, and understand the remaining or full state. Capacity remains correct under concurrent requests.

**Blocked by:** 11: Express interest and use basic My activity.

**Status:** ready

## Acceptance criteria

- [ ] An authenticated Explorer can register once for a scheduled public registration Event with remaining capacity.
- [ ] Registration uses an atomic database operation that cannot raise confirmed registrations above capacity, including concurrent attempts for the final place.
- [ ] A full attempt returns a specific recoverable result and leaves existing registrations unchanged.
- [ ] The participant can cancel a registration, after which capacity becomes available again.
- [ ] Repeated registration or cancellation requests return the resulting state without duplicate records or generic errors.
- [ ] Event details show capacity, confirmed or remaining places, full state, and the current User's registration state.
- [ ] My activity includes upcoming registrations alongside interests.
- [ ] Announcement and interest Events reject registration operations, and Event authors remain excluded from Participation.
- [ ] Registration controls expose pending, full, duplicate-action, cancelled-or-unavailable, and server-failure states on representative viewports.
- [ ] Automated tests cover successful and cancelled registration, response-mode rules, full capacity, repeated requests, author exclusion, My activity, and concurrent final-place attempts.
- [ ] The acceptance-to-evidence matrix records the tests and planned registration and capacity evidence.

## Implementation tasks

- [ ] Add atomic registration and cancellation operations that enforce response mode, authorization, uniqueness, and capacity.
- [ ] Extend Event details and My activity with responsive registration and capacity behavior.
- [ ] Extend Participation fixtures and seed helpers for available, nearly full, full, registered, and cancelled cases.
- [ ] Add server concurrency tests and browser tests for registration, capacity, cancellation, and failure results.
- [ ] Update the acceptance-to-evidence matrix with test references and planned production and screencast evidence.

## Comments
