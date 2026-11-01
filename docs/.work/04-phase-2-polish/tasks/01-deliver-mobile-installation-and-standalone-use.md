# 01: Prototype and deliver mobile installation and standalone use

**What to build:** Make Campus Connect installable and comfortable to launch and use as an online mobile application on Android Chrome and iPhone Safari. Prototype the user-facing installation and standalone experience before implementation.

**Blocked by:** None (can start immediately).

**Status:** ready

**Category:** enhancement

**Spec:** [Campus Connect Phase 2 polish](../spec.md)

## Acceptance criteria

- [ ] The selected prototype covers application identity/icons, installation guidance where appropriate, standalone navigation, safe areas, keyboard-open forms and filter sheets before implementation.
- [ ] Android Chrome and iPhone Safari support the appropriate installation/home-screen flow and recognizable application identity and icons.
- [ ] The installed application launches in standalone mode and retains the existing authenticated and public journeys.
- [ ] Header, content and navigation account for device safe areas and the home indicator; on-screen keyboards leave essential form and filter-sheet controls reachable.
- [ ] Normal browser use, including desktop Firefox, remains available; desktop installation is not an added acceptance gate.
- [ ] Existing browser checks verify representative install metadata and layouts at 360x800, 768x1024 and 1440x900. Installed-device behavior is verified separately rather than inferred from emulated dimensions.
- [ ] The complete repository quality command passes and implementation/check evidence is recorded without credentials.

## Implementation tasks

- [ ] Prototype the installation and installed-mode interactions before adding their production UI.
- [ ] Implement appropriate install metadata, icon assets and standalone/mobile layout handling without introducing offline Event workflows.
- [ ] Extend the existing browser and responsive checks at the application boundary.

## Project delivery

- [ ] In an isolated HTTPS candidate environment, manually verify Android Chrome and iPhone Safari installation, standalone launch, safe areas and keyboard-open forms/filter sheets. Record device/browser and results; any unavailable platform remains unverified until explicitly waived.
- [ ] In desktop Firefox, check ordinary browser discovery, authentication and navigation. Retain a credential-free result record.

## Comments

Second execution priority. It does not have a hard dependency on dark mode: ordering reflects Leo's preference, not a fabricated blocker. Final production verification remains with the existing release workflow.
