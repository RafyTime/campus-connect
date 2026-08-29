# 07: Create and edit Groups

**What to build:** Let an authenticated User create a Group and become its sole owner, then edit the Group's basic public details. This creator path uses the existing Group model and does not depend on following.

**Blocked by:** 04: Browse Groups and public group Events; 05: Complete accounts, profiles, and protected actions.

**Status:** ready

## Acceptance criteria

- [ ] Group creation requires a case-insensitively unique name and a valid short description.
- [ ] Creating a Group and its owner membership succeeds or fails as one transaction.
- [ ] A newly created Group has exactly one owner and no duplicate membership for that User.
- [ ] The owner can edit the Group's supported basic public fields.
- [ ] Representatives, subscribers, unrelated Users, and visitors cannot edit Group details.
- [ ] Representative management, ownership transfer, additional owners, Group deletion, image uploads, and arbitrary image URLs have no controls.
- [ ] Validation conflicts and authorization failures return explicit, usable results rather than generic server errors.
- [ ] Create and edit forms work at representative phone, tablet, and desktop sizes with accessible labels, focus, pending state, and inline errors.
- [ ] Automated tests cover uniqueness, transactional ownership, role authorization, validation, responsive forms, and failures.
- [ ] The acceptance-to-evidence matrix records the tests and planned Group-creation evidence.

## Implementation tasks

- [ ] Add transaction-backed Group creation and owner membership operations.
- [ ] Add owner-authorized basic Group editing without adding deferred administration controls.
- [ ] Build responsive create and edit forms with server-enforced validation and explicit failure results.
- [ ] Extend Group fixtures and seed helpers only as needed to prove uniqueness and authorization cases.
- [ ] Add server and browser tests for the accepted creation and editing behavior.
- [ ] Update the acceptance-to-evidence matrix with test references and planned production and screencast checks.

## Comments
