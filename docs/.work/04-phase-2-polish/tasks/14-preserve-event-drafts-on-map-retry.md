# 14: Preserve Event form input when retrying a failed map

**What to build:** Reproduce the map Retry reload risk in an edited Event form and make retry recover the map without discarding the draft.

**Blocked by:** None (can start immediately).

**Status:** completed

**Category:** bug

**Spec:** [Accepted cleanup scope](../cleanup-decision.md), separate behavior correction

## Acceptance criteria

- [x] A focused deterministic browser journey establishes the current behavior with an edited Event form and a failed map before implementation.
- [x] Retrying map loading preserves all entered Event fields and selected Tags/Location without publication, automatic form submission or a full-page reload.
- [x] Map failure remains explicit and retryable; Event details, Location label and Participation remain usable.
- [x] Existing theme, marker, attribution, external directions and map cleanup behavior remains valid.
- [x] Existing map and authoring browser seams are extended rather than adding a second test harness; no live map/geocoding dependency is required.
- [x] Focused verification and complete quality pass on disposable local data. Record any changed failure interaction.
- [x] If the proposed correction changes visible interaction beyond making the existing Retry action safe, review that UI change through a prototype before implementation.

## Implementation tasks

- [x] Inspect event-map.svelte and its Event form consumer at their current paths; use the [file map](../organization-file-map.md) if ticket 11 has moved them.
- [x] Reproduce the draft-loss risk, implement a bounded retry correction and record validation.

## Comments

The original audit found this by source inspection, not a browser reproduction. It is a separate bug, not a reason to bundle behavior changes into library moves or extract all Location-selection logic. If the risk no longer reproduces, record evidence and resolve explicitly rather than inventing a fix. Coordinate edits with ticket 11 if both are active.

2026-11-14 implementation: Reproduced in a browser before the fix. The new journey in `src/routes/event-maps.e2e.ts` fills a Create form (Title, Description, Start, End, Tech Tag, Registration, Capacity, Campus Library) with tiles aborted, then clicks Retry map. Before the fix, `window.location.reload()` reloaded `/create`: Title came back empty and Campus place returned to "Choose a campus place", so no map was rendered. The fix: Retry now increments an attempt counter that the map effect tracks, which disposes the old map and builds a new one in place. A second defect appeared once the failure-mode journeys also asserted no navigation and a styled map: after a stylesheet failure, Retry produced an unstyled map, because Vite never re-inserts a stylesheet link it has already added. The component now records stylesheet link load errors while the map is mounted and re-requests only those links on Retry. Changed failure interaction: none visible. The same status text and Retry map button remain, and Retry now recovers without a page reload, so no prototype was needed. All six failure journeys (tiles, style, script, stylesheet, worker, timeout) now assert in-place recovery with no main-frame navigation and Leaflet styles applied. The draft journey also asserts no POST requests. Validation: `vp run quality` passed on disposable data (191 unit, 140 e2e, 3 update journeys, build).
