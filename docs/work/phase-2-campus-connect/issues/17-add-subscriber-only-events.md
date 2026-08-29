# 17: Add subscriber-only Events

**What to build:** If its gate is go, add subscriber-only visibility as one complete stretch slice. Group members can discover restricted Events, existing participants retain direct access after unfollowing, and unauthorized requests disclose nothing. A no-go decision resolves this ticket as `wontfix` without changing the committed core.

**Blocked by:** 16: Deploy the committed core and decide stretch paths.

**Status:** ready

## Acceptance criteria

- [ ] The ticket records the subscriber-only Event gate outcome from ticket 16.
- [ ] For a go decision, only Group owners and representatives can publish subscriber-only group Events; personal Events remain public-only.
- [ ] For a go decision, current Group members discover and open subscriber-only Events, while outsiders do not see them in discovery.
- [ ] For a go decision, an unauthorized direct request returns a non-disclosing not-found response.
- [ ] For a go decision, an authorized User can participate according to the Event response mode.
- [ ] For a go decision, unfollowing removes discovery access but preserves Participation and direct access to an Event the User joined while authorized.
- [ ] For a go decision, visibility can change only before Participation exists and locks once Participation has been recorded.
- [ ] For a go decision, access-aware queries, controls, errors, and empty states work at representative phone, tablet, and desktop sizes.
- [ ] For a go decision, automated tests cover publication, discovery, direct access, Participation, visibility locking, unfollowing, retained history, and non-disclosure.
- [ ] For a go decision, the acceptance-to-evidence matrix records tests and the required production, screenshot, and screencast evidence.
- [ ] For a no-go decision, or when a go implementation cannot pass acceptance, the ticket is `wontfix`, its incomplete behavior is not exposed, its implementation checklist is explicitly waived in Comments, and Phase 3 and evidence records state the reason for deferral.

## Implementation tasks

- [ ] For a go decision, add subscriber-only authoring and server-enforced access rules without changing public personal Events.
- [ ] For a go decision, make discovery, direct Event retrieval, Participation, unfollowing, My activity, and My events access-aware.
- [ ] For a go decision, extend deterministic fixtures and seed helpers with current-member, outsider, former-member participant, owner, and representative cases.
- [ ] For a go decision, add server and browser tests for every restricted-access and retained-history rule.
- [ ] Update the acceptance-to-evidence matrix with the gate outcome and, when shipped, its test references and production evidence needs.

## Comments
