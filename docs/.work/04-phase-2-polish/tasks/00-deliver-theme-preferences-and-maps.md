# 00: Prototype and deliver theme preferences and matching maps

**What to build:** Let Visitors and Users choose System, Light or Dark appearance with a correct first paint and matching mapped Locations. Review the theme interaction in a prototype before implementing it; deliver the complete browser behavior and focused tests.

**Blocked by:** None (can start immediately).

**Status:** ready

**Category:** enhancement

**Spec:** [Campus Connect Phase 2 polish](../spec.md)

## Acceptance criteria

- [ ] A prototype makes the appearance control, both themes, representative forms/dialogs, focus states and maps reviewable before implementation; the selected treatment is recorded.
- [ ] The default follows the device theme. System, Light and Dark choices persist on the device across navigation, reloads and later visits without requiring account synchronization.
- [ ] The effective theme is applied before initial paint, without a visible flash of the wrong theme.
- [ ] Navigation, forms, dialogs, focus indicators and browser controls remain usable in both themes.
- [ ] Light mode retains Positron; dark mode uses its verified dark counterpart. Both preserve zoom level 16, one centered marker, attribution and the accepted non-interactive behavior.
- [ ] Existing browser tests cover system/override behavior, persistence and theme/map results through observable behavior. Responsive and accessibility checks cover representative screens in both themes.
- [ ] The complete repository quality command passes and a public-safe local check record identifies the selected prototype and validation.

## Implementation tasks

- [ ] Prototype the theme experience and verify the actual provider identifiers for both map styles.
- [ ] Implement device preference, first-paint handling and consistent theme integration using existing application boundaries.
- [ ] Extend existing browser, map and accessibility tests; preserve the lazy runtime database/authentication behavior.

## Comments

Highest execution priority. This feature does not wait for the general cleanup audit. Later navigation work must preserve its appearance control and behavior.

2026-11-02: Leo selected prototype A, the visible header appearance control, then requested shadcn-svelte Select with an icon on mobile and icon plus text on larger screens. The three original variants are preserved on local throwaway branch `codex/prototype-theme-preferences`, commit `9f55346`. Provider identifiers are verified as `positron` and `dark`, the latter derived from Dark Matter. Implementation and validation are recorded in the [local check record](../../../../evidence/phase-2/checks/polish-00-theme-preferences-local.md).
