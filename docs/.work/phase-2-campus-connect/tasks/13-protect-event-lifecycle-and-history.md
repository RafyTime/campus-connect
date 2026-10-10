# 13: Protect Event lifecycle and retained history

**What to build:** Protect Event and Participation history after publication. Participation locks sensitive Event changes, capacity changes remain safe, cancellation retains records, and ended Events become read-only.

**Blocked by:** 08: Publish and manage public personal Events; 12: Register for limited Events.

**Status:** ready

## Acceptance criteria

- [ ] Before Participation exists, a permitted Creator may edit every exposed Event field except host.
- [ ] After Participation exists, response mode, start, end, and Location are locked, while title, description, Tags, and capacity increases remain editable.
- [ ] Capacity cannot be lowered below the confirmed registration count.
- [ ] Cancellation is final, retains the Event, Post, and Participation records, blocks new Participation, and removes the Event from Discover.
- [ ] A cancelled Event remains available through its direct link and affected My activity and My events entries with a clear cancelled state.
- [ ] Ended Events are read-only and remain visible through relevant history views.
- [ ] There is no user-facing hard deletion, reopening, or draft state.
- [ ] Expected locked-field, capacity, cancellation, forbidden, and ended conflicts return explicit domain results.
- [ ] Lifecycle states remain understandable and usable on representative phone, tablet, and desktop layouts.
- [ ] Automated tests cover pre- and post-Participation editing, capacity changes, cancellation, discovery removal, blocked Participation, retained history, and ended read-only behavior.
- [ ] The acceptance-to-evidence matrix records the tests and planned lifecycle and history evidence.

## Implementation tasks

- [ ] Add lifecycle-aware Event mutation and cancellation operations with explicit conflict results.
- [ ] Extend creator forms, Event details, My activity, and My events with locked, cancelled, and ended states.
- [ ] Extend Event and Participation fixtures and seed helpers for scheduled, participated, cancelled, ended, and capacity-boundary cases.
- [ ] Add server and browser tests for every lifecycle rule and retained-history path.
- [ ] Update the acceptance-to-evidence matrix with test references and planned production, screenshot, and screencast evidence.

## Comments
