# Discover filter focus diagnosis

Date: 2026-10-19, Europe/Budapest

## Reproduction

The toolchain-upgrade waiver skipped the loading and focus case in `src/routes/event-filtering.e2e.ts`. Its loading and result assertions passed, but its final Host type focus assertion failed intermittently.

After building the current source and installing the matching Playwright Chromium, the original case failed five of twelve repetitions with six workers. Adding an assertion immediately after the initial `focus()` call moved three of twelve failures to that assertion, before any selection change or navigation. Failure output showed the control was initially disabled.

Discover intentionally disables its JavaScript filter controls until its handlers mount. The test attempted to focus the disabled Host type control during cold hydration. Its later selection succeeded after hydration, leaving the final assertion to report focus that had never been established.

## Correction

The case is enabled again. It waits for Host type to become enabled, focuses it, and verifies that focus before changing the selection. It then checks loading, filtered results, and retained focus after the held request completes.

All twelve repetitions passed with six workers after this correction. The application hydration guard remains in place. Formatting, linting, and Svelte/TypeScript checks passed. All 153 unit and integration tests passed, and the full Node-adapter browser run passed all 66 cases with six workers and no skipped cases. The production build passed.

The first complete Node run used a development-origin build and correctly rejected authentication requests at the different runtime origin. That run was discarded. The successful run built and served with `ORIGIN=http://127.0.0.1:4183`, as required by the Kit 3 setup. The prototype preview retains its separate origin and database at port 5183.

The focused command uses the freshly built Node adapter at port 4183 with Playwright's disposable database:

```powershell
$env:ORIGIN = 'http://127.0.0.1:4183'
bunx vp build
$env:PLAYWRIGHT_SERVER = 'node'
bunx vp run test:e2e src/routes/event-filtering.e2e.ts --grep 'changing a filter' --repeat-each=12 --workers=6
```

## UI prototype brief

The agreed direction is collapsed controls, immediately updated results and URL selections, and the existing Event cards and navigation. Three development-only variants on Discover explore category menus with a mobile bottom sheet, a unified filter panel, and inline expansion. Each exposes counts and removable active selections. The floating switcher and the `variant` query parameter select between them.

The preview at port 5183 uses a separate temporary seeded database. Local visual checks at 360x800 and 1440x900 found no horizontal overflow. The first Event begins at 265px on phone and 249px on desktop. Live Tag changes retain the selected variant and update the result count. Screenshots are local prototype artifacts, not final Railway evidence. The user selected category menus, then approved the date shortcuts, Type selections, and compact mobile accordion sheet. The final implementation replaces the prototype and is available on Discover without a variant parameter.

## Final implementation

The chosen layout keeps desktop controls in category popovers and mobile controls in a bottom sheet. Mobile sections start collapsed and only one opens at a time. Collapsed headings summarize selections; a live result count and Done remain outside the scrollable controls. The visible filter label is Type, while domain code retains response mode.

URL filters now include repeated `type=announcement`, `type=interest`, and `type=registration`. They match any selected response mode and combine with Tags, Group, host type, and date using AND. `date=today`, `date=tomorrow`, `date=week`, and `date=next-week` are evaluated against the injected clock in Europe/Berlin; weeks run Monday to Sunday. Existing `date=YYYY-MM-DD` links still work. Relative links remain relative after sharing or refresh. Choosing a custom date opens an input and updates the URL when a date is entered.

The browser tests exposed a rapid Type selection race while a request was pending. The control now tracks its immediate selection and merges each changed value into the pending URL. Both selections survive until server results arrive. Closing overlays waits for their exit animation before accessibility scans; touch-target measurements wait for popover scaling to finish.

The standards review reported no actionable findings. The spec review found a 28px mobile close button; it now measures 44px, and the existing mobile test checks it alongside Done. The reviewer confirmed the correction. The prototype source and screenshots are archived as local design evidence outside the repo under `C:/Users/Leonardo Plata/.codex/visualizations/2026/10/12/01a130ca-b223-7a03-9536-9545f2ed0317/discover-prototypes/`. No prototype code, local selection storage, or variant switcher remains in the application.

Final checks passed: formatting, Oxlint, ESLint, Svelte/TypeScript with zero errors or warnings, all 156 unit/integration tests across 14 files, the production build, and all 67 browser tests with six workers and no skipped cases. The final loading/focus case also passed all twelve repetitions with six workers after the popover redesign. Responsive browser coverage includes the open mobile sheet, 44px Close and Done targets, no horizontal overflow, and no serious or critical axe violations at 360x800, 768x1024, and 1440x900.

The first full browser run had one unrelated invalid-sign-in test time out while looking for the email input after sign-out; Discover's cases passed. That account case passed independently, then the entire 67-case suite passed on the final run with the same six-worker setting. No account code or tests were changed.

Validation used disposable local databases and the Node test server on port 4183. No deployment or production database operations were performed. Final Railway evidence remains planned in the acceptance matrix.
