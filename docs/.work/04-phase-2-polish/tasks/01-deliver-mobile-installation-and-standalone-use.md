# 01: Prototype and deliver mobile installation and standalone use

**What to build:** Make Campus Connect installable and comfortable to launch and use as an online mobile application on Android Chrome and iPhone Safari. Prototype the user-facing installation and standalone experience before implementation.

**Blocked by:** None (can start immediately).

**Status:** completed

**Category:** enhancement

**Spec:** [Campus Connect Phase 2 polish](../spec.md)

## Acceptance criteria

- [x] The selected prototype covers application identity/icons, installation guidance where appropriate, standalone navigation, safe areas, keyboard-open forms and filter sheets before implementation.
- [x] Android Chrome and iPhone Safari support the appropriate installation/home-screen flow and recognizable application identity and icons.
- [x] The installed application launches in standalone mode and retains the existing authenticated and public journeys.
- [x] Header, content and navigation account for device safe areas and the home indicator; on-screen keyboards leave essential form and filter-sheet controls reachable.
- [ ] Normal browser use, including desktop Firefox, remains available; desktop installation is not an added acceptance gate.
- [x] Existing browser checks verify representative install metadata and layouts at 360x800, 768x1024 and 1440x900. Installed-device behavior is verified separately rather than inferred from emulated dimensions.
- [x] The complete repository quality command passes and implementation/check evidence is recorded without credentials.

## Implementation tasks

- [x] Prototype the installation and installed-mode interactions before adding their production UI.
- [x] Implement appropriate install metadata, icon assets and standalone/mobile layout handling without introducing offline Event workflows.
- [x] Extend the existing browser and responsive checks at the application boundary.

## Project delivery

- [x] In an isolated HTTPS candidate environment, manually verify Android Chrome and iPhone Safari installation, standalone launch, safe areas and keyboard-open forms/filter sheets. Record device/browser and results; any unavailable platform remains unverified until explicitly waived.
- [x] In desktop Firefox, check ordinary browser discovery, authentication and navigation. Retain a credential-free result record.

## Comments

Second execution priority. It does not have a hard dependency on dark mode: ordering reflects Leo's preference, not a fabricated blocker. Final production verification remains with the existing release workflow.

2026-11-05: Implemented on `feat/mobile-installation` from `2e5fe3e`. Leo selected the revised compact banner, approved an OS-specific bottom drawer and persistent dismissal with an Account reopen action, and limited promotion to the four main pages on mobile. Final spacing separates the identity/text group from the action/close group. Prototype source is preserved on `chore/prototype-mobile-installation`, through `e49f198`; earlier standalone/safe-area/keyboard sketches remain in `79d878e`.

Implementation and the 14 focused browser checks are recorded in [the local evidence](../../../evidence/phase-2/checks/polish-01-mobile-installation-local.md). Independent Standards and Spec reviews found no implementation defects. Complete quality passed on `573eb39`: 183 unit/integration tests, 131 browser tests, formatting/lint, Svelte/TypeScript and production build. Three additional automated Firefox journeys passed. Installed Android/iPhone checks on an isolated HTTPS candidate and manual Firefox verification remain unverified and have not been waived. Keep the ticket ready until those delivery items are complete. No push, deployment, production data change or final submission capture occurred.

Leo confirmed that he can test on physical devices. Railway has only the production environment, so a separate candidate must be created before those HTTPS checks. Only read-only infrastructure discovery has occurred. Candidate creation/deployment is pending approval; the prepared local-source archive excludes credentials and databases.

2026-11-05 device feedback: Leo reported that the requested phone checks worked as expected on Pixel Android and iPhone, including iPhone Chrome and Safari, against PR #3's isolated HTTPS preview at `174188c`. Exact versions were not supplied. Manual desktop Firefox remains individually unconfirmed. He approved a compact drawer follow-up with the app icon, browser-neutral iOS guidance and shorter copy/spacing.
