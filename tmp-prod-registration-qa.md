# Production QA: Event registration

Use a creator account and two Explorer accounts in separate browser sessions.

1. Create a public registration Event with capacity **1**. Confirm the creator cannot register.
2. While signed out, click **Register for Event**. Confirm the sign-in dialog appears.
3. Open the Event in both Explorer sessions before registering. Register Explorer A, then try Explorer B. Confirm B gets a clear full-capacity message and A keeps their place.
4. Refresh A's page. Confirm registration persists, remaining capacity is **0**, and My activity labels it **Registered**.
5. Cancel A's registration. Confirm it disappears from A's My activity and one place becomes available. Register B successfully.
6. Rapidly double-click registration or cancellation. Confirm there are no duplicates or errors.
7. On mobile, confirm controls fit and remain usable. Check that interest Events still work, announcements have no registration controls, and cancelled or ended Events cannot accept registration.

Record the deployed commit, date, and any failures.
