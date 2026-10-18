# 10: Filter public Events

**What to build:** Let visitors and Users narrow the public Event feed by Tags, date, Group, and host type. Filter state survives refresh and sharing because the URL is the source of truth.

**Blocked by:** 04: Browse Groups and public group Events.

**Status:** ready

## Acceptance criteria

- [x] Discover supports one or more Tags, date, Group, and personal or group host-type filters.
- [x] An Event matches any selected Tag, while different filter categories combine with AND semantics.
- [x] Date filtering follows Europe/Berlin boundaries and does not shift Events across dates incorrectly.
- [x] The backend normalizes filter input, applies access and scheduled-Event rules, orders results by soonest start, and returns the result count.
- [x] The URL represents the active filters and restores the same selection and results after refresh or direct navigation.
- [x] Users can clear all filters and recover from a no-matching-results state.
- [x] Invalid or unknown query values are ignored or normalized without exposing a server error.
- [x] Controls, active-filter summaries, counts, loading, and empty states work at representative phone, tablet, and desktop sizes.
- [x] Automated tests cover Tag OR semantics, cross-category AND semantics, date boundaries, Group and host filters, ordering, counts, URL restoration, clearing, and invalid input.
- [x] The acceptance-to-evidence matrix records the tests and planned desktop and mobile filtering evidence.

## Implementation tasks

- [x] Add normalized public discovery filters and result counts to the server application operation.
- [x] Build URL-backed responsive filter controls, active state, result count, clear action, and no-match recovery.
- [x] Add server and browser tests for every filter rule, ordering, URL restoration, invalid input, and responsive interaction.
- [x] Extend Event fixtures and seed helpers only where a distinct filter or date case requires another record.
- [x] Update the acceptance-to-evidence matrix with test references and planned production, screenshot, and screencast evidence.

## Comments

- 2026-10-12: Discover filters use repeated `tag` query parameters plus `date`, `group`, and `host`. The backend returns normalized selections, filter options, ordered public scheduled Events, and counts. Date matches the Europe/Berlin start date. Seven application tests and nine browser tests cover the filter rules, DST transitions, URL restoration, invalid input, clearing, pending selections, focus, and responsive accessibility. Existing fixtures supply all browser cases; date boundaries use disposable records. CORE-10 is `verified-local`; final Railway checks and captures remain planned. See [the local verification record](../../../evidence/phase-2/checks/10-public-event-filtering-local.md).
