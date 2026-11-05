# Mobile installation and standalone use

Local implementation on 2026-11-05, Europe/Berlin, on `feat/mobile-installation`. Baseline `2e5fe3ea8cd4cb13b55d050ac7abf8f1a452aff8`; implementation `e68f578`, with test-runner follow-ups in `2c7f25d` and `573eb39`. No push, deployment, production database or daily-driver preview change.

## Selected prototype and behavior

Leo rejected the initial installation card, dialog and disclosure placements. He selected a compact, dismissible banner based on his web.dev example, then approved a consistent Install action opening a small bottom sheet with platform-specific instructions. The full throwaway prototype is preserved on local branch `chore/prototype-mobile-installation`, through `e49f198`; the final banner-and-drawer preview is preserved in `c536fe8`. Earlier commit `79d878e` also preserves the identity, standalone navigation, safe-area, form and filter-sheet keyboard sketches. Those sketches simulate device geometry and do not prove installed-device behavior. Prototype controls, URL overrides and simulated installation do not ship in the feature branch.

The approved banner appears on Discover, Groups, My activity and My events until dismissed. It stays absent from forms and detail pages. Dismissal persists on the device across navigation and reloads. If device storage is restricted, the in-memory preference survives navigation during the current visit; a warning explains that it could not be saved for later visits. Mobile Account offers Install Campus Connect even after dismissal. Standalone mode hides both entries; desktop has no installation promotion. Browser-provided installation remains available.

The final spacing groups the 36px identity mark and text separately from the Install and close controls, with a larger gap between groups and 44px touch targets. The short subtitle avoids an orphaned word at 360px. The header retains its existing compact horizontal padding while accounting for cutouts.

The installation sheet gives all iOS browsers the same Share / Add to Home Screen / Add steps, including Open as Web App when shown. Android browsers receive menu instructions until a browser-owned `beforeinstallprompt` event supplies a native Install app action. Each event is consumed once; acceptance, dismissal and failure leave an honest state. Failures offer the menu route. No native prompt opens automatically.

## Identity and layout

The manifest declares a stable `/` identity, scope and Discover launch URL with standalone display. The existing linked-circle SVG supplies 192px and 512px PNG icons, a separate opaque maskable icon with the mark inside its safe zone, and an opaque 180px Apple touch icon. Application names and Apple launch metadata are global. ModeWatcher's existing initial-paint mechanism also controls browser theme color, including saved appearance overrides.

The viewport opts into device safe areas and Android's content-resizing keyboard behavior. Header, content and navigation account for cutouts and the home indicator. Bottom sheets use the visual viewport height and bottom offset, with safe-area padding. Filter-sheet header and footer remain outside the scrollable fields. Focused form inputs hide the fixed mobile destination bar; touch-device fields retain 16px text. Layout changes preserve the existing online journeys and ADR 0001's lazy database/authentication boundary.

No service worker, Event caching, mutation queue, offline map or push capability was added. Offline recovery and user-controlled updates remain owned by ticket 02.

## Validation

Testing uses the existing Playwright application boundary and disposable SQLite setup, as agreed in the specification. The manifest test first failed because the manifest was absent. The mobile journey test first failed because the banner was absent. Both passed after their implementation slices.

The 14 focused checks passed:

- Manifest identity, launch URL, icon availability and decoded dimensions, including Apple launch metadata on another route.
- Main-page continuity for public and authenticated journeys, absence on forms/detail pages, persistent dismissal, Account reopening and keyboard focus return.
- Android native prompt acceptance, cancellation and failure through the browser-owned event boundary, without production test hooks.
- Representative standalone launch, public navigation, registration and authenticated navigation with installation entries absent. The legacy standalone flag is simulated; this is not a physical installation test.
- No ordinary desktop installation promotion.
- Banner and bottom-sheet bounds, 44px banner targets, focus return and no serious or critical axe violations in both themes at 360x800, 768x1024 and 1440x900. Mobile identity is supplied explicitly, including the larger sizes; desktop exclusion is checked separately.
- Reachable form submission and filter-sheet Done controls at a reduced 360x400 viewport. Reduced dimensions are not evidence of a real operating-system keyboard.

Svelte/TypeScript and lint passed. The first full quality run passed 183 unit/integration tests and 130 of 131 browser tests. An existing Group-authoring journey timed out at 30 seconds during its final axe scan; none of its assertions reported a violation. The isolated rerun passed in 11.4 seconds. The existing multi-route audit now has a local 60-second budget, matching core-quality, with every assertion retained. A subsequent run encountered several unrelated accessibility timeouts under shared-machine CPU load and was stopped. CI mode now caps Playwright at two workers; local defaults remain unchanged. All test assertions are retained. The final complete quality command passed on code revision `573eb39`: formatting, lint, Svelte/TypeScript with zero errors or warnings, all 183 unit/integration tests, all 131 Chromium browser tests, and the production Node-adapter build. Command: `CI=1 PLAYWRIGHT_BROWSERS_PATH=/home/lplata/.cache/ms-playwright VITEST_MAX_WORKERS=2 bun run quality`. The browser suite completed in 5.6 minutes with two workers. The existing lazy map-renderer chunk-size advisory remains. Final evidence-only edits receive formatting, local-link and diff validation.

Three existing desktop journeys passed in Firefox 157.0 using the Playwright-matched build in `/tmp`: public destination navigation, registration with a session retained through navigation/reload, and sign-in with a session retained through reload. This used a separate disposable database and a snapshot of the same built app. The first attempt could not launch because the matching Firefox binary was absent; downloading it resolved that harness prerequisite. These are automated Firefox results, not the required manual verification.

## Code review

The code-review skill ran independent, read-only reviews of `git diff 2e5fe3ea8cd4cb13b55d050ac7abf8f1a452aff8...e68f578`, followed by the test-runner changes through `573eb39`.

### Standards

No actionable standards violations or concrete code smells; no ADR conflicts. The timeout and CI-concurrency follow-ups also had no findings.

### Spec

No implementation defects or scope creep. The timeout and CI-concurrency follow-ups also had no findings. Physical installed-device and manual Firefox checks remain missing verification, rather than proven implementation defects.

Review totals: Standards 0 unresolved findings; Spec 0 implementation findings, with the manual acceptance gaps below.

## Candidate preparation

Leo confirmed that he can run the real-device checks. Read-only Railway discovery found that the existing Campus Connect project has only a production environment. No infrastructure was changed. A source archive of reviewed code revision `573eb39` is prepared under `/tmp`, excluding local environment credentials, SQLite files and installed dependencies. PR #3 subsequently authorized the branch push and preview deployment. The isolated `pr-3-mobile-installation` environment uses its own service, fresh SQLite volume and new auth secret. [The HTTPS preview](https://campus-connect-pr-3-pr-3-mobile-installation.up.railway.app) follows the feature branch; production remains unchanged.

## Required candidate checks

The phone checks below were subsequently reported passed by Leo, as recorded in the device-feedback section. Manual desktop Firefox remains individually unconfirmed. Ticket 01 stays `ready` until its remaining delivery checklist is satisfied or Leo explicitly waives a gap.

- Isolated HTTPS candidate, Android Chrome: record device, OS and browser versions; inspect the icon, open the sheet and native installation, launch standalone, sign in and navigate, check safe areas and the home indicator where applicable, and open form/filter keyboards with essential controls reachable.
- Isolated HTTPS candidate, iPhone Safari: record device, iOS and Safari versions; follow Share / Add to Home Screen, inspect the icon and standalone launch, exercise public and authenticated navigation, safe areas and home indicator, and keyboard-open forms/filter sheets. Do not assume Safari's existing login transfers to a newly installed app; verify sign-in in the installed context.
- Desktop Firefox: manually check ordinary public discovery, authentication and navigation, and record the version and results.

Keep records free of passwords, session values and private payloads. No final Railway submission media has been captured for this slice.

## References

- [Browser installation criteria](https://web.dev/articles/install-criteria) and [native-prompt lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event).
- [Apple home-screen installation](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/27/ios/27).
- [Owning ticket](../../../.work/04-phase-2-polish/tasks/01-deliver-mobile-installation-and-standalone-use.md) and [acceptance-to-evidence matrix](../../../.work/01-phase-2-campus-connect/acceptance-evidence.md).

## Device feedback and compact drawer follow-up

Leo reported that the requested checks worked as expected on his Pixel Android phone and his girlfriend's iPhone, including Chrome and Safari on iPhone. These checks used the PR #3 HTTPS preview at revision `174188c`; exact device/OS/browser versions were not supplied. Manual desktop Firefox verification has not been individually confirmed.

Leo then approved browser-neutral iOS instructions, the application icon beside the title on both platforms, the subtitle "Internet connection required.", and shorter copy and spacing. The follow-up removes the obsolete iOS browser distinction. Svelte/TypeScript passed; all 10 focused installation and responsive/axe browser checks passed for the compact drawer. Physical installation behavior is unchanged.
