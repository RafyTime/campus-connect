# 13: Protect Event lifecycle and retained history

**What to build:** Protect Event and Participation history after publication. Participation locks sensitive Event changes, capacity changes remain safe, cancellation retains records, and ended Events become read-only.

**Blocked by:** 08: Publish and manage public personal Events; 12: Register for limited Events.

**Status:** completed

## Acceptance criteria

- [x] Before Participation exists, a permitted Creator may edit every exposed Event field except host.
- [x] After Participation exists, response mode, start, end, and Location are locked, while title, description, Tags, and capacity increases remain editable.
- [x] Capacity cannot be lowered below the confirmed registration count.
- [x] Cancellation is final, retains the Event, Post, and Participation records, blocks new Participation, and removes the Event from Discover.
- [x] A cancelled Event remains available through its direct link and affected My activity and My events entries with a clear cancelled state.
- [x] Ended Events are read-only and remain visible through relevant history views.
- [x] There is no user-facing hard deletion, reopening, or draft state.
- [x] Expected locked-field, capacity, cancellation, forbidden, and ended conflicts return explicit domain results.
- [x] Lifecycle states remain understandable and usable on representative phone, tablet, and desktop layouts.
- [x] Automated tests cover pre- and post-Participation editing, capacity changes, cancellation, discovery removal, blocked Participation, retained history, and ended read-only behavior.
- [x] The acceptance-to-evidence matrix records the tests and planned lifecycle and history evidence.

## Implementation tasks

- [x] Add lifecycle-aware Event mutation and cancellation operations with explicit conflict results.
- [x] Extend creator forms, Event details, My activity, and My events with locked, cancelled, and ended states.
- [x] Extend Event and Participation fixtures and seed helpers for scheduled, participated, cancelled, ended, and capacity-boundary cases.
- [x] Add server and browser tests for every lifecycle rule and retained-history path.
- [x] Update the acceptance-to-evidence matrix with test references and planned production, screenshot, and screencast evidence.

## Comments

Implemented and verified locally on 2026-10-20. Lifecycle-aware edit and cancellation operations serialize with Participation writes, preserve records and locked timestamps, and return explicit conflicts. Creator forms, direct details and retained-history journeys are covered at phone, tablet and desktop sizes. Existing flexible fixtures support all lifecycle cases; the accumulated seed now includes idempotent ended registration history. No schema migration is required.

Formatting, lint, Svelte/TypeScript checks, production build and all 181 Vitest tests passed. The full Playwright run passed 84 cases; four resource-contention timeouts then passed in isolation with two workers, completing all 88 cases. Standards and Spec review have no remaining findings; timestamp-precision findings were fixed with a regression test. See [local verification](../../../evidence/phase-2/checks/13-event-lifecycle-local.md) and CORE-13 in the acceptance-to-evidence matrix. Final Railway checks and submission captures remain planned there; this ticket does not require deployment or final capture.
