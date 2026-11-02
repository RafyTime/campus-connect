# Theme preferences and matching maps

Local implementation on 2026-11-02, Europe/Budapest. Production deployment and final submission captures remain owned by the release and evidence tickets.

## Selected prototype

Leo selected variant A, the visible header control, after reviewing three placements on the existing Event page. He requested the shared shadcn-svelte Select instead of NativeSelect, with an icon on mobile and icon plus text on larger screens. The full throwaway prototype and its three screenshots are preserved on local branch `codex/prototype-theme-preferences`, commit `9f55346`. Prototype code and comparison controls are absent from the implementation branch.

The finished control uses the configured Rhea style, Hugeicons, semantic theme tokens and a 44px trigger and options. It preserves the full brand and account links at 360px. Its accessible name is Appearance, and the menu names every choice. Keyboard focus returns to the trigger after selection. The header can wrap at narrower widths.

## Delivered behavior

Following [shadcn-svelte's dark-mode guide](https://shadcn-svelte.com/docs/dark-mode/svelte), the root layout mounts `ModeWatcher`. Its synchronous head script applies the saved device preference or system appearance before the page renders, including the native browser color scheme. The library persists System, Light or Dark locally and tracks device changes while System is selected. No account data or schema changes are involved.

Mapped Locations wait for the resolved appearance before loading the lazy renderer. Light uses `https://tiles.openfreemap.org/styles/positron`; dark uses `https://tiles.openfreemap.org/styles/dark`. [The provider's style repository](https://github.com/hyperknot/openfreemap-styles) identifies those as forks of Positron and Dark Matter. Theme changes dispose the previous renderer and resize observer, then rebuild the map at the same Location. Zoom remains MapLibre 16, with one centered marker, persistent attribution and disabled interaction. Discover and plain-text Locations still avoid map resources.

## Validation

The existing browser boundaries cover the behavior:

- `public-shell.e2e.ts`: system default, explicit override, navigation, reload, later visits, device changes, visible keyboard focus and a correct themed background with client modules blocked before hydration.
- `event-maps.e2e.ts`: both provider styles at zoom 16, centered marker and attribution, live appearance switching and existing resource-failure recovery. Responsive, keyboard and axe checks run in both themes at 360x800, 768x1024 and 1440x900.
- `core-quality.e2e.ts`: public and authenticated routes, form validation, authentication dialogs, focus return, actual control bounds and no serious or critical axe violations at those three sizes in both themes.

The appearance test first failed because the control did not exist; it passed after implementation. The map test first failed because dark mode requested Positron; it passed with the verified dark style. A reused build served at a different origin rejected form submissions during an intermediate check. The complete quality run rebuilds at the matching origin rather than weakening the form security check.

Complete repository quality and two-axis review results are pending.

Manual local preview uses port 4190 and a dedicated temporary prototype database. The actual Positron provider map rendered without the fallback. Automated map fixtures replace external HTTP responses and retain the real renderer and worker. No production, live database or daily-driver preview was touched. ADR 0001's lazy runtime database/authentication boundaries remain unchanged.
