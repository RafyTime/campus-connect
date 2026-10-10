# 10: Filter public Events

**What to build:** Let visitors and Users narrow the public Event feed by Tags, date, Group, and host type. Filter state survives refresh and sharing because the URL is the source of truth.

**Blocked by:** 04: Browse Groups and public group Events.

**Status:** ready

## Acceptance criteria

- [ ] Discover supports one or more Tags, date, Group, and personal or group host-type filters.
- [ ] An Event matches any selected Tag, while different filter categories combine with AND semantics.
- [ ] Date filtering follows Europe/Berlin boundaries and does not shift Events across dates incorrectly.
- [ ] The backend normalizes filter input, applies access and scheduled-Event rules, orders results by soonest start, and returns the result count.
- [ ] The URL represents the active filters and restores the same selection and results after refresh or direct navigation.
- [ ] Users can clear all filters and recover from a no-matching-results state.
- [ ] Invalid or unknown query values are ignored or normalized without exposing a server error.
- [ ] Controls, active-filter summaries, counts, loading, and empty states work at representative phone, tablet, and desktop sizes.
- [ ] Automated tests cover Tag OR semantics, cross-category AND semantics, date boundaries, Group and host filters, ordering, counts, URL restoration, clearing, and invalid input.
- [ ] The acceptance-to-evidence matrix records the tests and planned desktop and mobile filtering evidence.

## Implementation tasks

- [ ] Add normalized public discovery filters and result counts to the server application operation.
- [ ] Build URL-backed responsive filter controls, active state, result count, clear action, and no-match recovery.
- [ ] Add server and browser tests for every filter rule, ordering, URL restoration, invalid input, and responsive interaction.
- [ ] Extend Event fixtures and seed helpers only where a distinct filter or date case requires another record.
- [ ] Update the acceptance-to-evidence matrix with test references and planned production, screenshot, and screencast evidence.

## Comments
