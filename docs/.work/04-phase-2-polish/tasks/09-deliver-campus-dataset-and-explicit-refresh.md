# 09: Deliver the agreed dataset and explicit refresh operation

**What to build:** Make the agreed campus catalog reproducible on an isolated demonstration dataset, with accurate Locations, credible Event examples and a deliberate refresh/reset operation whose effects are explicit.

**Blocked by:** [04: Make routine seeding safe and separate public test fixtures](04-preserve-data-during-routine-seeding.md); [08: Agree the final campus demonstration catalog](08-agree-campus-demonstration-catalog.md)

**Status:** ready

**Category:** enhancement

**Spec:** [Campus Connect Phase 2 polish](../spec.md)

## Acceptance criteria

- [ ] The implementation matches ticket 08's agreed Groups, Events, Locations and provenance, including verified coordinates and accurate demonstration/real-occurrence distinctions.
- [ ] Interest, registration, full-capacity, cancelled and ended scenarios can be demonstrated using realistic public content.
- [ ] Routine setup retains ticket 04's preservation behavior. Refreshing dates/content or resetting demonstration states requires a distinct explicit operation with affected records and effects documented.
- [ ] The refresh/reset operation stays within its agreed demonstration scope; unrelated manually created content and relationships are preserved.
- [ ] Dates, titles, weekdays, response modes and capacity examples remain internally consistent after the intended refresh. No demonstration account credentials are recorded in repository evidence.
- [ ] Disposable-database and browser checks verify the resulting catalog, preserved manual data and explicit refresh/reset behavior through existing boundaries.
- [ ] The complete repository quality command passes. Running the operation against live data is left to the separately authorized release workflow.

## Implementation tasks

- [ ] Implement the agreed catalog and explicit refresh/reset mechanism using the safe routine seed behavior.
- [ ] Validate fresh setup, repeat seeding and deliberate refresh on disposable data, and document effects and operation.
- [ ] Update relevant demonstration expectations and evidence inputs without weakening deterministic failure/security fixtures.

## Comments

Both safe seed semantics and the final content decision genuinely gate this work. Do not choose a new seed schema or management UI unless a concrete need is justified through the applicable workflow.
