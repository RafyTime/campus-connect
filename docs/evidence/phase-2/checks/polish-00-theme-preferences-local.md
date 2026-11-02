# Theme preferences and matching maps

Local implementation on 2026-11-02, Europe/Budapest. Production deployment and final submission captures remain owned by the release and evidence tickets.

## Selected prototype

Leo selected variant A, the visible header control, after reviewing three placements on the existing Event page. He requested the shared shadcn-svelte Select instead of NativeSelect, with an icon on mobile and icon plus text on larger screens. The full throwaway prototype and its three screenshots are preserved on local branch `codex/prototype-theme-preferences`, commit `9f55346`. Prototype code and comparison controls are absent from the implementation branch.

The finished control uses the configured Rhea style, Hugeicons, semantic theme tokens and a 44px trigger and options. It preserves the full brand and account links at 360px. Its accessible name is Appearance, and the menu names every choice. Keyboard focus returns to the trigger after selection. The header can wrap at narrower widths.

Final control choice on 2026-11-02: Leo selected a fixed half-filled circle contrast icon on every screen size, an Appearance tooltip and accessible label, and System / Light / Dark menu labels. Menu choices retain their individual computer, sun and moon icons. The shared shadcn Tooltip provider wraps the application, and its trigger composes with Select on one button. The stored `system` value and preference behavior are unchanged. Mobile and desktop preview inspection confirmed the tooltip, selection and 44x44 CSS pixel trigger. The complete quality command passed with 183 unit/integration tests, 117 browser tests and the production build.

## Delivered behavior

Following [shadcn-svelte's dark-mode guide](https://shadcn-svelte.com/docs/dark-mode/svelte), the root layout mounts `ModeWatcher`. Its synchronous head script applies the saved device preference or system appearance before the page renders, including the native browser color scheme. The library persists System, Light or Dark locally and tracks device changes while System is selected. No account data or schema changes are involved.

Mapped Locations wait for the resolved appearance before loading the lazy renderer. Light uses `https://tiles.openfreemap.org/styles/positron`; dark uses `https://tiles.openfreemap.org/styles/dark`. [The provider's style repository](https://github.com/hyperknot/openfreemap-styles) identifies those as forks of Positron and Dark Matter. Theme changes dispose the previous renderer and resize observer, then rebuild the map at the same Location. Zoom remains MapLibre 16, with one centered marker, persistent attribution and disabled interaction. Discover and plain-text Locations still avoid map resources.

## Validation

The existing browser boundaries cover the behavior:

- `public-shell.e2e.ts`: system default, explicit override, navigation, reload, later visits, device changes, visible keyboard focus and a correct themed background with client modules blocked before hydration.
- `event-maps.e2e.ts`: both provider styles at zoom 16, centered marker and attribution, live appearance switching and existing resource-failure recovery. Responsive, keyboard and axe checks run in both themes at 360x800, 768x1024 and 1440x900.
- `core-quality.e2e.ts`: public and authenticated routes, form validation, authentication dialogs, focus return, actual control bounds and no serious or critical axe violations at those three sizes in both themes.

The appearance test first failed because the control did not exist; it passed after implementation. The map test first failed because dark mode requested Positron; it passed with the verified dark style. A reused build served at a different origin rejected form submissions during an intermediate check. The complete quality run rebuilds at the matching origin rather than weakening the form security check.

The first complete run passed all 183 unit/integration tests and 111 of 117 browser tests. The failures exposed an ambiguous Appearance locator while its menu closed, an existing keyboard test focusing a disabled Follow button, and client-only Tag controls accepting clicks before hydration. The locator now scopes to the banner; the keyboard test waits for the control to become enabled; the Tag fieldset stays disabled until its handlers mount. The original filled-form sequence passed after that guard. The appearance trigger's measured 32px registry height was raised to a 44px minimum and added to the existing touch-target audit. Incidental installer dependency upgrades were removed. A frozen-lockfile install passed with the original Bits UI and icon versions plus `mode-watcher`.

The final `bun run quality` passed for implementation revision `6142217`: formatting, lint, Svelte/TypeScript with zero errors or warnings, all 183 unit/integration tests, all 117 Playwright tests and the production build. The run used the installed Chromium cache through `PLAYWRIGHT_BROWSERS_PATH`, `VITEST_MAX_WORKERS=2` and the default six browser workers. The existing lazy renderer chunk-size advisory remains. Documentation-only completion updates receive a final formatting/lint and link/diff check.

The final fixes also give the loading map a valid labeled group role and semantic background before its renderer mounts. An existing account test now waits for sign-out's redirect before opening Sign in, matching its adjacent test and removing a confirmed navigation race. No assertions were removed or weakened.

## Code review

Review baseline: `434bbb3a42cbee79f88347916bfba7907dc05401`. The code-review skill ran independent, read-only Standards and Spec reviews of implementation commit `a5016f6`, followed by the changes through `ec0d46b` and the loading-map correction in `9b9f3a3`.

### Standards

No documented-standard violations or actionable code smells. The follow-up hydration guard, scoped locators and dependency restoration received no findings.

### Spec

No missing behavior, implementation mistakes or scope findings. The follow-up interaction fixes received no findings.

Review totals: Standards 0 unresolved findings; Spec 0 unresolved findings.

Manual local preview uses port 4190 and a dedicated temporary prototype database. Both actual provider maps rendered without the fallback. The mobile trigger measured 44x44 CSS pixels; desktop inspection confirmed the matching icon and text. Automated map fixtures replace external HTTP responses and retain the real renderer and worker. No production, live database or daily-driver preview was touched. ADR 0001's lazy runtime database/authentication boundaries remain unchanged.
