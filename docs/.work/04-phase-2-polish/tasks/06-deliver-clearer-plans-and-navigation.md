# 06: Prototype and deliver clearer plans and navigation

**What to build:** Make it clear what a User is registered for, what is next, what they are interested in and which retained Events are ended or cancelled. Prototype the navigation and information hierarchy before delivering the complete revised journeys.

**Blocked by:** None (can start immediately).

**Status:** ready

**Category:** enhancement

**Spec:** [Campus Connect Phase 2 polish](../spec.md)

## Acceptance criteria

- [ ] A reviewed prototype determines navigation, labels, Event information hierarchy, grouping controls and empty/loading/validation/failure states before implementation; it may reorganize My activity and My events.
- [ ] Ongoing registered Events receive priority, followed by upcoming registrations ordered soonest first. Interests are visibly distinct, and history remains accessible without crowding current plans.
- [ ] Upcoming, ongoing and ended presentation uses the agreed start/end boundaries and cancellation precedence without adding a persisted lifecycle status.
- [ ] Creator cancellation retains Event details and relevant Participation; withdrawing interest or cancelling registration removes that Participation from the personal view. Past registration is never claimed as attendance.
- [ ] Public discovery, protected-action prompts, personal plans and Creator management remain reachable, and existing authorization/capacity rules are preserved.
- [ ] The revised navigation preserves the delivered theme preferences, installation/standalone behavior and offline/update controls. Final combined verification remains in ticket 10.
- [ ] Existing application-operation tests with a controlled clock cover exact lifecycle boundaries, and browser journeys cover the new presentation and retained capabilities.
- [ ] Both themes pass representative 360x800, 768x1024 and 1440x900 layout/keyboard checks and no critical or serious automated accessibility violations. The complete repository quality command passes.

## Implementation tasks

- [ ] Prototype alternative navigation and personal-plan arrangements against the agreed outcomes, then record the selected design.
- [ ] Implement the chosen complete journeys using existing Event/Participation data and application boundaries.
- [ ] Extend existing lifecycle, browser, responsive and accessibility checks and record the resulting evidence needs.

## Comments

No speculative cleanup blocker: this feature can begin with its prototype independently of the architecture workflow. Dark-mode/PWA work has higher execution priority. If a reviewed audit identifies an actual prerequisite, record that concrete edge before dependent implementation.
