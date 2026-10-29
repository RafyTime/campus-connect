# 14: Show curated Event maps

**What to build:** Show a simple visual map for Events using curated mapped campus Locations while keeping manual plain-text Locations fully usable. The map supplies a marker and attribution, not directions or coordinate editing.

**Blocked by:** 03: Browse public personal Events.

**Status:** completed

## Acceptance criteria

- [x] Event details load Leaflet and the OpenFreeMap Positron renderer only when the Event's Location has coordinates.
- [x] A mapped Location shows one marker at its stored coordinates and keeps the Location label visible outside the map.
- [x] OpenStreetMap attribution remains visible and usable at every supported viewport.
- [x] A manual plain-text Location renders its label without loading a map.
- [x] Map tile or script failure leaves the Event description, time, host, Tags, Location label, and Participation controls usable.
- [x] Maps fit 360x800, 768x1024, and 1440x900 layouts without horizontal page scrolling, clipped controls, or trapped keyboard focus.
- [x] Routing, directions, draggable markers, manual coordinate entry, and address search are absent.
- [x] Automated tests cover mapped and plain-text Locations, marker coordinates, attribution, conditional loading, responsive layout, and map failure behavior.
- [x] The acceptance-to-evidence matrix records the tests and planned Event-map evidence.

## Implementation tasks

- [x] Add the Leaflet Event-detail map for curated coordinates with persistent attribution and accessible surrounding content.
- [x] Add the plain-text-only rendering path and recoverable map loading failure state.
- [x] Extend Location fixtures and seed helpers only as needed for mapped, unmapped, and failure cases.
- [x] Add browser tests for conditional map loading, marker placement, attribution, responsive behavior, and failure degradation.
- [x] Update the acceptance-to-evidence matrix with test references and planned production, screenshot, and screencast evidence.

## Comments

Implemented on 2026-10-27. Reused existing mapped and plain-text Location fixtures. Local verification, review results and final Railway/CAP-03/VIDEO-01 evidence plan: [Curated Event maps local checks](../../../evidence/phase-2/checks/14-curated-event-maps-local.md). Final deployment checks and submission media remain planned in the acceptance-to-evidence matrix.

On 2026-10-28, Leo selected the unmodified OpenFreeMap Positron style at zoom 16 after comparing Bright, Liberty and Positron. Keep the circular app-colored marker and existing frame. The production map remains non-interactive. The temporary comparison source is retained as a local artifact outside the application; no archive-branch commit is created without direct commit authorization. Campus coordinates remain unchanged and unverified.
