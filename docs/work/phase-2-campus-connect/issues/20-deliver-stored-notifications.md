# 20: Deliver Notifications and release the stretch package

**What to build:** If the updates plus Notifications package gate is go, deliver stored Notifications for newly published group Events and Group updates, then expose both package features together. If either half cannot pass acceptance, expose neither and resolve both tickets as `wontfix`.

**Blocked by:** 19: Publish Group updates.

**Status:** ready

## Acceptance criteria

- [ ] The ticket uses the same package gate outcome recorded by ticket 19.
- [ ] For a go decision, publishing a group Event or Group update creates one stored Notification for every current subscriber except the author.
- [ ] For a go decision, Campus Updates creates no Notifications and repeated publication handling cannot duplicate delivery for the same recipient and target.
- [ ] For a go decision, each Notification stores its recipient, target content, creation time, and nullable read time.
- [ ] For a go decision, an authenticated User can see an unread count and Notification list, navigate to an accessible target, mark one Notification read, and mark all read.
- [ ] For a go decision, target navigation marks the selected Notification read without granting access the User does not otherwise have.
- [ ] For a go decision, real-time refresh, push, email, preferences, edit alerts, and cancellation alerts are absent.
- [ ] For a go decision, Notification navigation, empty state, unread state, and failures work on representative phone, tablet, and desktop layouts.
- [ ] For a go decision, automated tests cover recipient selection, author exclusion, Campus Updates exclusion, deduplication, unread counts, read operations, target authorization, responsive behavior, and failures.
- [ ] For a go decision, Group updates and Notifications become visible only after both tickets pass their acceptance and release checks.
- [ ] For a go decision, the acceptance-to-evidence matrix records tests and the required production, screenshot, and screencast evidence.
- [ ] If either half cannot ship, tickets 19 and 20 are `wontfix`, their incomplete implementation is not exposed, waivers and reasons are recorded in Comments, and Phase 3 and evidence records state the deferral.

## Implementation tasks

- [ ] For a go decision, add Notification persistence with recipient-target deduplication and a generated migration.
- [ ] For a go decision, add deterministic Notification fixtures and idempotent seed helpers for unread, read, excluded-author, and multiple-recipient cases.
- [ ] For a go decision, create Notifications transactionally from group Event and Group update publication.
- [ ] For a go decision, add responsive unread count, list, target navigation, mark-read, and mark-all-read behavior.
- [ ] For a go decision, add server and browser tests for delivery, deduplication, read state, authorization, responsive behavior, and failures.
- [ ] For a go decision, remove the package release boundary only after Group updates and Notifications both pass.
- [ ] Update the acceptance-to-evidence matrix with the package outcome, test references, and production evidence needs.

## Comments
