# Campus Connect Phase 2 polish

Status: draft — grilling in progress

This file is a working record of the grilling session, not a finalized specification. After the session, Leo will provide the spec and ticket skills for the next workflow step. Do not finalize this draft, mark it ready or generate implementation tickets before that handoff.

## Relationship to Phase 2

This specification adds finishing requirements to [the original Phase 2 specification](../01-phase-2-campus-connect/phase-2-spec.md). It preserves the existing Phase 2 ticket structure and completed core behavior. Its implementation tickets must finish before [ticket 21: final release and repository documentation](../01-phase-2-campus-connect/tasks/21-finalize-release-and-repository-docs.md), followed by the existing evidence, presentation and submission sequence in tickets 22–24.

Nominatim geocoding remains owned by [existing ticket 18](../01-phase-2-campus-connect/tasks/18-add-nominatim-geocoding.md). This specification does not duplicate that feature or the original stretch-decision workflow.

## Agreed scope

The remaining product work focuses on:

- Participation clarity: a signed-in User can understand what they are registered for, what is next, what they are interested in, and which Events are cancelled or ended.
- Focused UI/UX improvements, starting with that Explorer journey and extending to Discover and Creator screens where needed for consistency.
- Dark mode and PWA/mobile handling, with the bounded requirements below.
- Bounded code cleanup based on concrete findings rather than a general architectural rewrite.
- Accurate campus Locations and coordinates, verified real Group details where used, and representative demonstration Events. Do not present an invented Event as a verified real campus occurrence.

The exact screen changes and acceptance criteria remain subject to this interview. This draft does not authorize product implementation or production changes.

## Settled Participation behavior

Preserve the distinction between cancelling an Event and withdrawing Participation. A Creator's Event cancellation retains the Event and relevant Participation history. A User cancelling registration or withdrawing interest removes that Participation from My activity. The polish work does not introduce a personal record of withdrawn Participation.

History presentation may include cancelled and ended Events associated with retained Participation. Do not describe past registration as attendance: attendance tracking is outside this scope.

## Reported UI and UX problems

Leo identified missing dark mode, missing proper PWA handling for the mobile experience, and an overall interface that feels messy and confusing to navigate. These observations are requirements inputs. The interview and prototypes must turn the navigation and information-hierarchy concerns into concrete user outcomes rather than prescribing an unreviewed layout.

## Theme requirements

- Follow the device's theme by default.
- Offer System, Light and Dark preferences, persisted on the device. Account-synced theme preferences are not required.
- Apply the resolved theme before initial paint to avoid flashing the wrong theme.
- Prototype and verify forms, dialogs, focus indicators and browser controls in both light and dark themes.
- Use the current light Positron map style in light mode and its dark counterpart in dark mode. Leo confirmed that a dark counterpart exists; verify its provider style identifier during prototyping rather than guessing it here. Preserve zoom level 16, the single marker, attribution and current interaction restrictions, and review both themes in the prototype.

## PWA requirements

- Support installation with appropriate application identity and icons, standalone launch and comfortable mobile layout.
- Show a useful offline screen with a retry path when connectivity prevents using the application.
- Event data and actions remain online. Offline registration, queued changes, push notifications and offline maps are outside this scope.
- Target installation and standalone use on Android Chrome and iPhone Safari. Retain desktop Firefox as a normal-browser check; desktop installation is not a separate release requirement. Record actual platform validation and any unverified behavior.
- Follow PWA best practices within this agreed online scope. Prototype and verify safe-area handling, the home indicator, on-screen keyboards and usable forms/filter sheets in installed mode.
- Offer a clear refresh action when a new version is available. Do not force a reload while a User is filling out a form. Verify that an existing installation can receive a release without reinstalling.

## Navigation prototype scope

The prototype may change existing destinations, labels and screen hierarchy, including the My activity/My events distinction. Preserve discovery, participation review and Creator management capabilities. Explore clear navigation around discovering something, seeing personal plans and managing published content; these are user intentions, not mandated navigation labels or a prescribed number of tabs.

## Required workflows

### UI and UX

Every implementation task that changes UI or UX must include prototyping before implementation. The prototype must make the proposed behavior and relevant states reviewable before production code changes begin. Specific screens and interactions will be settled during this interview.

### Code cleanup and quality

Start with a general code-quality audit covering duplication, confusing responsibilities, stale code and inconsistent components. Then run the `improve-codebase-architecture` skill and follow its architecture exploration, candidate report and design discussion before implementing selected cleanup work. The audit findings determine the bounded implementation scope; running an audit does not require accepting every refactor it suggests.

If cleanup also changes UI or UX, its task must satisfy both the architecture and prototype prerequisites.

### Final demonstration data

The seed-data task must start with a short grilling session to agree the final Groups, Events and Locations. Record the chosen content, provenance of real-world claims and expected demonstration states before changing the seed. This session will settle the content later; the current interview specifies its requirements rather than choosing the final campus catalog.

## Existing behavior to distinguish

- My activity currently mixes interests and registrations in one grid, ordered by Event start time.
- Creator cancellation preserves an Event and its Participation history. Cancelling a User's registration or withdrawing interest currently removes that Participation record, so it disappears from My activity.
- Ended presentation is derived from the Event's end time; stored lifecycle state is scheduled or cancelled. An Event already in progress is currently still scheduled.
- Registration reserves a place; it does not establish that a User attended.

These are implementation facts, not newly approved requirements. Any change to them must be decided explicitly and reflected in the domain glossary when terminology is resolved.

## Decisions still open

- Leo's specific missing behaviors and UI/UX issues, and which are required for this release.
- Participation grouping, ordering, navigation, wording and empty states.
- Treatment and terminology for Events that have started but have not ended.
- Concrete cleanup scope after the required audits.
- The later seed-content grilling session's acceptance criteria and seed safety requirements.
- Final task breakdown, dependencies and links into release/evidence work.

Confirm the complete requirements with Leo at the end of grilling, then wait for the spec and ticket skills he will supply before finalizing the specification or generating tickets. Add glossary terms only as their meaning becomes settled; create an ADR only for a consequential architectural trade-off that needs its rationale preserved. Product implementation requires completion of the agreed specification workflow and the task-specific prototype or audit prerequisites.
