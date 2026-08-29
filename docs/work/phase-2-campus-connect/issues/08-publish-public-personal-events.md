# 08: Publish and manage public personal Events

**What to build:** Let an authenticated Creator publish a public personal Event, find it through Discover and My events, and edit its supported fields before Participation exists. The form supports all committed response modes, curated campus Locations, and manual plain-text Locations.

**Blocked by:** 03: Browse public personal Events; 05: Complete accounts, profiles, and protected actions.

**Status:** ready

## Acceptance criteria

- [ ] A Creator can publish a personal Event with a title of 5 to 100 characters, description of 20 to 2,000 characters, one to three normalized Tags, future start, later end, response mode, and Location.
- [ ] Campus dates are entered and presented in Europe/Berlin and stored unambiguously.
- [ ] Announcement and interest Events have no capacity; registration Events require a positive capacity.
- [ ] Committed-core authoring assigns public visibility and exposes no subscriber-only or invite-only choice.
- [ ] A Creator can select a curated campus Location or save a manual plain-text Location without coordinates.
- [ ] Valid Events publish immediately with scheduled status and appear through public discovery without a draft step.
- [ ] The author can find manageable Events in My events and edit every exposed field except host before Participation exists.
- [ ] Authenticated navigation exposes Create and My events when their routes become available.
- [ ] Host cannot change after publication, and other Users cannot edit the Event.
- [ ] Client validation helps correct input, while the server independently enforces every rule and permission.
- [ ] The form and My events work at representative phone, tablet, and desktop sizes with accessible labels, pending state, errors, empty state, and general failure state.
- [ ] Automated tests cover field boundaries, timezone handling, response-mode capacity rules, public visibility, publication, authorization, host immutability, Location choices, and My events.
- [ ] The acceptance-to-evidence matrix records the tests and planned publication and My events evidence.

## Implementation tasks

- [ ] Add server application operations for personal Event creation, retrieval for management, and pre-Participation editing.
- [ ] Build responsive personal Event create and edit forms and the initial My events view, then add Create and My events to authenticated navigation.
- [ ] Support curated Location selection and manual plain-text Location creation without adding geocoding.
- [ ] Extend Event and Location fixtures and idempotent seed helpers for authoring and validation cases.
- [ ] Add server and browser tests for validation, publication, authorization, editing, Location choices, and My events.
- [ ] Update the acceptance-to-evidence matrix with test references and planned production, screenshot, and screencast evidence.

## Comments
