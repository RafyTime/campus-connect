# 00: Prototype and deliver theme preferences and matching maps

**What to build:** Let Visitors and Users choose System, Light or Dark appearance with a correct first paint and matching mapped Locations. Review the theme interaction in a prototype before implementing it; deliver the complete browser behavior and focused tests.

**Blocked by:** None (can start immediately).

**Status:** completed

**Category:** enhancement

**Spec:** [Campus Connect Phase 2 polish](../spec.md)

## Acceptance criteria

- [x] A prototype makes the appearance control, both themes, representative forms/dialogs, focus states and maps reviewable before implementation; the selected treatment is recorded.
- [x] The default follows the device theme. System, Light and Dark choices persist on the device across navigation, reloads and later visits without requiring account synchronization.
- [x] The effective theme is applied before initial paint, without a visible flash of the wrong theme.
- [x] Navigation, forms, dialogs, focus indicators and browser controls remain usable in both themes.
- [x] Light mode retains Positron; dark mode uses its verified dark counterpart. Both preserve zoom level 16, one centered marker, attribution and the accepted non-interactive behavior.
- [x] Existing browser tests cover system/override behavior, persistence and theme/map results through observable behavior. Responsive and accessibility checks cover representative screens in both themes.
- [x] The complete repository quality command passes and a public-safe local check record identifies the selected prototype and validation.

## Implementation tasks

- [x] Prototype the theme experience and verify the actual provider identifiers for both map styles.
- [x] Implement device preference, first-paint handling and consistent theme integration using existing application boundaries.
- [x] Extend existing browser, map and accessibility tests; preserve the lazy runtime database/authentication behavior.

## Comments

2026-11-02: Completed locally. The full quality command passed with 183 unit/integration tests, 117 browser tests and the production build. Standards and Spec reviews have zero unresolved findings. Production deployment and final evidence remain with their existing tickets.

Highest execution priority. This feature does not wait for the general cleanup audit. Later navigation work must preserve its appearance control and behavior.

2026-11-02: Leo selected prototype A, the visible header appearance control, then requested shadcn-svelte Select with an icon on mobile and icon plus text on larger screens. The three original variants are preserved on local throwaway branch `codex/prototype-theme-preferences`, commit `9f55346`. Provider identifiers are verified as `positron` and `dark`, the latter derived from Dark Matter. Implementation and validation are recorded in the [local check record](../../../evidence/phase-2/checks/polish-00-theme-preferences-local.md).
