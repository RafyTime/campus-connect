# 09: Publish public group Events

**What to build:** Extend the public Event creator journey so seeded Group owners and representatives can publish and manage Events on behalf of their Group. The ticket uses seeded authorization contexts and does not depend on creating or following a Group.

**Blocked by:** 04: Browse Groups and public group Events; 08: Publish and manage public personal Events.

**Status:** ready

## Acceptance criteria

- [ ] A seeded Group owner or representative can select an authorized Group as the host and publish a public group Event.
- [ ] The Event's Post records its Group and acting User author, and host type remains derived from the Group relationship.
- [ ] A subscriber, unrelated User, or visitor cannot publish or manage an Event for the Group.
- [ ] The author and other current owners or representatives can find manageable Group Events in My events according to the agreed permissions.
- [ ] Group Event authoring enforces the same field, timezone, response-mode, public-visibility, Tag, and Location rules as personal Event authoring.
- [ ] Published group Events appear in Discover and on Group details without requiring the Group-creation ticket's output.
- [ ] Forms expose clear empty, forbidden, validation, pending, and server-failure states at representative phone, tablet, and desktop sizes.
- [ ] Automated tests cover owner and representative authority, forbidden roles, host derivation, publication, management visibility, and public discovery.
- [ ] The acceptance-to-evidence matrix records the tests and planned group Event publication evidence.

## Implementation tasks

- [ ] Extend Event authoring operations to authorize and persist Group hosts using the seeded membership contexts.
- [ ] Extend the creator form and My events with authorized Group-host choices and management behavior.
- [ ] Add server and browser tests for owner, representative, subscriber, unrelated User, and visitor cases.
- [ ] Extend group Event fixtures and idempotent seed helpers only as needed for the new authorization and publication cases.
- [ ] Update the acceptance-to-evidence matrix with test references and planned production, screenshot, and screencast evidence.

## Comments
