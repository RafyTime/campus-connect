# 10: Filter public Events

**What to build:** Let visitors and Users narrow the public Event feed by Tags, date, Group, and host type. Filter state survives refresh and sharing because the URL is the source of truth.

**Blocked by:** 04: Browse Groups and public group Events.

**Status:** completed

## Acceptance criteria

- [x] Discover supports one or more Tags, date, Group, and personal or group host-type filters.
- [x] An Event matches any selected Tag, while different filter categories combine with AND semantics.
- [x] The Type filter selects Announcement, Interest, and Registration with OR semantics within Type and AND with other filters.
- [x] Date shortcuts include Any date, Today, Tomorrow, This week, Next week, and Choose a date. Weeks run Monday to Sunday in Europe/Berlin. Shared relative presets are evaluated when opened.
- [x] Desktop uses category popovers; mobile uses a bottom sheet with one accordion section open at a time, selection summaries, live results, and Done. Controls start collapsed.
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

- 2026-10-19: Selected category menus with the compact mobile accordion sheet after interactive review. The final user-facing label is **Type**; the domain property remains response mode. Added `type=announcement|interest|registration` as a repeated query parameter, and `date=today|tomorrow|week|next-week` alongside existing `date=YYYY-MM-DD` links. New selections use the server query and URL rather than prototype memory. The throwaway source is archived outside the repository at `C:/Users/Leonardo Plata/.codex/visualizations/2026/10/12/01a130ca-b223-7a03-9536-9545f2ed0317/discover-prototypes/discover-filters.prototype.svelte`; no prototype switcher ships. Final validation passed: formatting, lint, typecheck, 156 unit/integration tests, production build, all 67 browser cases with six workers, and twelve focus-test repetitions with six workers. Standards and spec reviews have no remaining findings. See [the final local evidence](../../../evidence/phase-2/checks/10-filter-focus-diagnosis.md).

- 2026-10-19: Reopened the UI review after the toolchain upgrade. The skipped loading/focus test is enabled again and now waits for the hydrated Host control before focusing it. The original case failed five of twelve six-worker repetitions; checking focus before navigation exposed the initial disabled-control race. All twelve repetitions passed after the correction, and the full Node browser suite passed all 66 cases with six workers. Three development-only Discover variants explore category menus, a unified panel, and inline expansion. The agreed brief keeps controls collapsed, updates filters immediately, and preserves existing cards and navigation. Final UI selection remains pending. See [the diagnosis and prototype record](../../../evidence/phase-2/checks/10-filter-focus-diagnosis.md).

- 2026-10-12: Discover filters use repeated `tag` query parameters plus `date`, `group`, and `host`. The backend returns normalized selections, filter options, ordered public scheduled Events, and counts. Date matches the Europe/Berlin start date. Seven application tests and nine browser tests cover the filter rules, DST transitions, URL restoration, invalid input, clearing, pending selections, focus, and responsive accessibility. Existing fixtures supply all browser cases; date boundaries use disposable records. CORE-10 is `verified-local`; final Railway checks and captures remain planned. See [the local verification record](../../../evidence/phase-2/checks/10-public-event-filtering-local.md).
