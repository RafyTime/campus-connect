# Temporary production QA: Event lifecycle

Use a Creator and a separate Explorer account, with disposable QA Events.

- Deployed commit:
- Review date:
- Unexpected behavior:

## Checklist

- [ ] **Before joining:** Publish a registration Event. Edit its schedule, Location, response mode, title and Tags. All should save; host stays fixed.
- [ ] **After joining:** Register as Explorer. As Creator, confirm schedule, Location and response mode are locked. Update title, description and Tags; increase capacity. A capacity decrease should fail.
- [ ] **Cancellation:** Cancel the Event and confirm. It should disappear from Discover and remain accessible by direct link with a clear cancelled state.
- [ ] **Retained history:** Confirm it remains in Creator's **My events** and Explorer's **My activity**. Registration and withdrawal controls should be unavailable.
- [ ] **Ended Event:** Check an ended record in both histories. Details remain accessible; editing and cancellation are unavailable.
- [ ] **Interest and mobile:** Repeat the lock and cancellation checks for an interest Event, then check the main screens at phone width for readable states and clipped controls.
