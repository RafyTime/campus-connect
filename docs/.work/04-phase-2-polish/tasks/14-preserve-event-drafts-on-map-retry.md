# 14: Preserve Event form input when retrying a failed map

**What to build:** Reproduce the map Retry reload risk in an edited Event form and make retry recover the map without discarding the draft.

**Blocked by:** None (can start immediately).

**Status:** ready

**Category:** bug

**Spec:** [Accepted cleanup scope](../cleanup-decision.md), separate behavior correction

## Acceptance criteria

- [ ] A focused deterministic browser journey establishes the current behavior with an edited Event form and a failed map before implementation.
- [ ] Retrying map loading preserves all entered Event fields and selected Tags/Location without publication, automatic form submission or a full-page reload.
- [ ] Map failure remains explicit and retryable; Event details, Location label and Participation remain usable.
- [ ] Existing theme, marker, attribution, external directions and map cleanup behavior remains valid.
- [ ] Existing map and authoring browser seams are extended rather than adding a second test harness; no live map/geocoding dependency is required.
- [ ] Focused verification and complete quality pass on disposable local data. Record any changed failure interaction.
- [ ] If the proposed correction changes visible interaction beyond making the existing Retry action safe, review that UI change through a prototype before implementation.

## Implementation tasks

- [ ] Inspect event-map.svelte and its Event form consumer at their current paths; use the [file map](../organization-file-map.md) if ticket 11 has moved them.
- [ ] Reproduce the draft-loss risk, implement a bounded retry correction and record validation.

## Comments

The original audit found this by source inspection, not a browser reproduction. It is a separate bug, not a reason to bundle behavior changes into library moves or extract all Location-selection logic. If the risk no longer reproduces, record evidence and resolve explicitly rather than inventing a fix. Coordinate edits with ticket 11 if both are active.
