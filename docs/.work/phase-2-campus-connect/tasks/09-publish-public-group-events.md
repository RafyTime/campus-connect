# 09: Publish public group Events

**What to build:** Extend the public Event creator journey so seeded Group owners and representatives can publish and manage Events on behalf of their Group. The ticket uses seeded authorization contexts and does not depend on creating or following a Group.

**Blocked by:** 04: Browse Groups and public group Events; 08: Publish and manage public personal Events.

**Status:** completed

## Acceptance criteria

- [x] A seeded Group owner or representative can select an authorized Group as the host and publish a public group Event.
- [x] The Event's Post records its Group and acting User author, and host type remains derived from the Group relationship.
- [x] A subscriber, unrelated User, or visitor cannot publish or manage an Event for the Group.
- [x] The author and other current owners or representatives can find manageable Group Events in My events according to the agreed permissions.
- [x] Group Event authoring enforces the same field, timezone, response-mode, public-visibility, Tag, and Location rules as personal Event authoring.
- [x] Published group Events appear in Discover and on Group details without requiring the Group-creation ticket's output.
- [x] Forms expose clear empty, forbidden, validation, pending, and server-failure states at representative phone, tablet, and desktop sizes.
- [x] Automated tests cover owner and representative authority, forbidden roles, host derivation, publication, management visibility, and public discovery.
- [x] The acceptance-to-evidence matrix records the tests and planned group Event publication evidence.

## Implementation tasks

- [x] Extend Event authoring operations to authorize and persist Group hosts using the seeded membership contexts.
- [x] Extend the creator form and My events with authorized Group-host choices and management behavior.
- [x] Add server and browser tests for owner, representative, subscriber, unrelated User, and visitor cases.
- [x] Extend group Event fixtures and idempotent seed helpers only as needed for the new authorization and publication cases.
- [x] Update the acceptance-to-evidence matrix with test references and planned production, screenshot, and screencast evidence.

## Comments

2026-10-12: Implemented public Group Event publication through the shared Event form, authorized Group choices, current owner and representative management, and My events. Group Events retain their original Group and acting author during editing. Subscriber, unrelated User, visitor, and former-manager access is rejected. Campus Updates remains system-managed. Existing role fixtures support publication without Group creation or following; test-only credentials are seeded idempotently in the disposable browser database. All checks passed with `bun run quality`: lint, typecheck, 146 unit and integration tests, 56 browser tests, accessibility scans, and the production build. Standards and Spec reviews found no findings. See [local verification](../../../evidence/phase-2/checks/09-group-event-authoring-local.md) and [CORE-09 evidence](../acceptance-evidence.md). Final Railway checks and captures remain planned. Participation-dependent locks and cancellation remain in ticket 13. Changes are uncommitted.
