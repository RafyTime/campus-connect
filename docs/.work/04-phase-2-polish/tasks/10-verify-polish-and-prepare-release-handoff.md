# 10: Verify integrated polish and prepare release handoff

**What to build:** Verify the combined polish on the candidate application and hand complete behavior/check/evidence inputs to the existing final-release workflow. This ticket does not duplicate the Railway deployment or final submission captures.

**Blocked by:** [00: Prototype and deliver theme preferences and matching maps](00-deliver-theme-preferences-and-maps.md); [02: Prototype and deliver offline recovery and safe updates](02-deliver-offline-recovery-and-safe-updates.md); [06: Prototype and deliver clearer plans and navigation](06-deliver-clearer-plans-and-navigation.md); [07: Consolidate browser journeys under e2e](07-implement-selected-cleanup.md); [11: Organize library code by module ownership](11-organize-library-modules.md); [12: Remove confirmed starter code and obsolete Group tests](12-remove-confirmed-stale-code.md); [13: Refresh the codebase navigation guide](13-refresh-codebase-navigation-docs.md); [14: Preserve Event form input when retrying a failed map](14-preserve-event-drafts-on-map-retry.md); [09: Deliver the agreed dataset and explicit refresh operation](09-deliver-campus-dataset-and-explicit-refresh.md); [Original Phase 2 18: Add Nominatim geocoding](../../01-phase-2-campus-connect/tasks/18-add-nominatim-geocoding.md)

**Status:** ready

**Category:** enhancement

**Spec:** [Campus Connect Phase 2 polish](../spec.md)

## Acceptance criteria

- [ ] All selected polish implementations and the agreed dataset are integrated; original geocoding ticket 18 is completed or explicitly resolved wontfix before this final combined verification.
- [ ] Public discovery, authenticated Exploration, personal publication and Group publication pass with clear plans/history and preserved server-owned permissions, capacity and Participation semantics.
- [ ] Theme controls and both map styles, installation/standalone layout, offline recovery and safe updates work coherently with the final navigation.
- [ ] Revised screens pass responsive and keyboard checks at 360x800, 768x1024 and 1440x900 in both themes, with no critical or serious automated accessibility violations.
- [ ] Android Chrome and iPhone Safari installed behavior and desktop Firefox results are recorded with platform/browser and outcome. Unverified items remain explicit gaps until checked or expressly waived.
- [ ] Routine seed preservation, the explicit demo refresh/reset effects and realistic capture states are verified on disposable candidate data.
- [ ] The complete quality command passes for the handoff revision. The existing evidence matrix identifies changed behaviors, successful checks and final Railway scenes still to capture.
- [ ] Original ticket 21 is the release gate after this handoff; final deployment, production migrations/seed and final captures remain owned by original tickets 21-24.

## Implementation tasks

- [ ] Run combined candidate journeys, focused seed verification and the complete quality command.
- [ ] Consolidate the prototype/audit/implementation records and update the existing acceptance-to-evidence inputs.
- [ ] Record scope, checks, known limits and remaining production verification for the existing release ticket.

## Project delivery

- [ ] In the isolated candidate application, finish or reconcile the manual installed-device and desktop Firefox checks across the integrated navigation/themes. Retain public-safe results rather than treating local captures as final submission media.

## Comments

Original Phase 2 ticket 18 is an additional external blocker. Resolution follows the tracker rule: completed or explicit wontfix. This gate includes any accepted follow-up cleanup slices added after the architecture review. Do not deploy, seed production or capture final submission evidence under this ticket.

2026-11-13: Accepted ticket 05 slices 11-14 are explicit blockers of final handoff, alongside existing 07. See [scope decision](../cleanup-decision.md).
