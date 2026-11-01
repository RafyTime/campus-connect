# 02: Prototype and deliver offline recovery and safe updates

**What to build:** Give the installed online application a useful offline screen, retry path and user-controlled refresh when a new version is available. Prototype these states before implementation and verify updating an existing installation without reinstalling.

**Blocked by:** [01: Prototype and deliver mobile installation and standalone use](01-deliver-mobile-installation-and-standalone-use.md)

**Status:** ready

**Category:** enhancement

**Spec:** [Campus Connect Phase 2 polish](../spec.md)

## Acceptance criteria

- [ ] The selected prototype covers lost connectivity, retry, update availability and update handling during form entry before implementation.
- [ ] When connectivity prevents application use, a useful offline fallback explains the state and offers a working retry path.
- [ ] Event data and actions remain online. Offline attempts never imply confirmed registration or successful Participation changes, and no mutation queue, push notifications or offline maps are added.
- [ ] An available release exposes a clear refresh action without forcing a reload while a User fills out a form.
- [ ] An existing installation can receive the new release without reinstalling; declining or postponing refresh does not itself interrupt the active form.
- [ ] Browser-level verification exercises offline/reconnection behavior and an update between two candidate builds, including update availability during form entry.
- [ ] The complete repository quality command passes and update/offline evidence is recorded without retaining credentials or private application payloads.

## Implementation tasks

- [ ] Prototype offline and update interactions and choose a bounded implementation suited to the existing application.
- [ ] Implement the fallback/retry and update behavior without expanding into offline data workflows.
- [ ] Extend existing browser tests to cover offline failure/recovery and observable update transitions.

## Project delivery

- [ ] Using isolated candidate builds, verify offline recovery and upgrading an existing installed application on the targeted mobile platforms. Record the versions, device/browser, results and any explicitly waived gap.

## Comments

Third execution priority. Ticket 01 supplies the installed application against which the update and offline journeys are verified. It is not blocked by general architecture cleanup.
