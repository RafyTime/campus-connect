# 14: Show curated Event maps

**What to build:** Show a simple visual map for Events using curated mapped campus Locations while keeping manual plain-text Locations fully usable. The map supplies a marker and attribution, not directions or coordinate editing.

**Blocked by:** 03: Browse public personal Events.

**Status:** ready

## Acceptance criteria

- [ ] Event details load Leaflet and OpenStreetMap tiles only when the Event's Location has coordinates.
- [ ] A mapped Location shows one marker at its stored coordinates and keeps the Location label visible outside the map.
- [ ] OpenStreetMap attribution remains visible and usable at every supported viewport.
- [ ] A manual plain-text Location renders its label without loading a map.
- [ ] Map tile or script failure leaves the Event description, time, host, Tags, Location label, and Participation controls usable.
- [ ] Maps fit 360x800, 768x1024, and 1440x900 layouts without horizontal page scrolling, clipped controls, or trapped keyboard focus.
- [ ] Routing, directions, draggable markers, manual coordinate entry, and address search are absent.
- [ ] Automated tests cover mapped and plain-text Locations, marker coordinates, attribution, conditional loading, responsive layout, and map failure behavior.
- [ ] The acceptance-to-evidence matrix records the tests and planned Event-map evidence.

## Implementation tasks

- [ ] Add the Leaflet Event-detail map for curated coordinates with persistent attribution and accessible surrounding content.
- [ ] Add the plain-text-only rendering path and recoverable map loading failure state.
- [ ] Extend Location fixtures and seed helpers only as needed for mapped, unmapped, and failure cases.
- [ ] Add browser tests for conditional map loading, marker placement, attribution, responsive behavior, and failure degradation.
- [ ] Update the acceptance-to-evidence matrix with test references and planned production, screenshot, and screencast evidence.

## Comments
