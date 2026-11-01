# Ticket 16: Phase 2 stretch decisions — 2026-11-01

Decision date: 2026-11-01 (Europe/Berlin).

Decision owner: Leo. These outcomes were agreed during the Phase 2 polish discussion and confirmed for closeout. This is a dated scope/decision record, not final submission media.

## Core gate and release evidence

The reviewed core revision `ce3b7dddbaa30f30a49d7a1e12380c05e2e791bb` passed CI and reached Railway SUCCESS on 2026-10-29, deployment `161e4689-2e8a-4374-8d96-1a59c5d0730d`. Runtime migration and seed commands succeeded. Core smoke, user-reported Firefox/keyboard checks, representative production viewport checks and capture-feasibility rehearsal passed. See [the core release record](16-core-release.md) for exact evidence and its limits.

## Subscriber-only Events — no-go

- Owning ticket: [17: Add subscriber-only Events](../../../.work/01-phase-2-campus-connect/tasks/17-add-subscriber-only-events.md).
- Phase 2 outcome: **no-go; wontfix**.
- Reason: restricted audiences add a narrower use case to an already working public Event journey. Clearer personal plans/navigation, themes, mobile installation and campus demonstration quality have higher value for the remaining Phase 2 work.
- Phase 3 deferral: subscriber-only Group Event publication and access-aware discovery, direct access, Participation, visibility locks and retained access after unfollowing.
- Conditional implementation/testing/capture tasks are waived for Phase 2. No incomplete restricted-access behavior is to be exposed.
- Final Phase 2 screenshot/screencast evidence: N/A — the feature is deferred. The decision and deferral are the evidence for this outcome.

## Nominatim geocoding — go

- Owning ticket: [18: Add Nominatim geocoding](../../../.work/01-phase-2-campus-connect/tasks/18-add-nominatim-geocoding.md).
- Phase 2 outcome: **go; ready**. This is permission to retain the feature in the backlog, not a claim that it has shipped.
- Reason: explicit address search improves the existing Location-publication workflow and builds on the application's existing coordinate storage and map rendering. Its bounded integration offers more immediate value than restricted audiences or another content/notification system.
- Preserve the complete ticket 18 contract: explicit Search, normalized persistent cache with scope version, global provider throttling, an application identifier, configurable provider, Germany/greater Bonn-Cologne bounds, at most five transformed results, explicit selection and manual plain-text fallback.
- Before final release, require server and browser tests with a replacement provider for caching, scope versioning, global throttling, regional filtering, invalid/empty/error/timeout/rate-limited responses, selection and saved coordinates. Do not test against the public provider.
- Record the selected user-facing design, provider configuration, bounds, usage limits and attribution. Verify fresh migrations, seed behavior and the full quality command for the eventual implementation.
- Railway evidence must show explicit search, selected-result publication, persisted mapped Location, a cache hit and a working failure/manual fallback, with deployed commit and date. The evidence matrix must link the actual implementation tests and required final screenshot/screencast scenes before ticket 18 is completed.
- Implementation order follows the approved priority: dark mode and PWA first. Geocoding remains in original ticket 18 rather than being duplicated in the polish backlog.

## Group updates plus Notifications — no-go as one package

- Owning tickets: [19: Publish Group updates](../../../.work/01-phase-2-campus-connect/tasks/19-publish-group-updates.md) and [20: Deliver Notifications](../../../.work/01-phase-2-campus-connect/tasks/20-deliver-stored-notifications.md).
- Phase 2 outcome: **no-go; both wontfix**.
- Reason: the immediate need is clarity about current registrations, interests, what is next and cancelled/ended history. Reorganizing the existing experience addresses that need with less additional product and maintenance scope than a second content type plus stored notification delivery.
- Phase 3 deferral: the complete Group update publication/viewing/editing/deletion and stored Notification recipient/deduplication/unread/read/target-navigation package. Neither half ships independently in Phase 2.
- Conditional implementation/testing/capture tasks are waived for both tickets. No incomplete package controls or routes are to be exposed.
- Final Phase 2 screenshot/screencast evidence: N/A — the package is deferred. The shared decision and Phase 3 deferral are the evidence for both outcomes.

## Polish and release relationship

The approved [Phase 2 polish specification](../../../.work/04-phase-2-polish/spec.md) and [published backlog](../../../.work/04-phase-2-polish/README.md) own the new finishing work. Its preferred order starts with dark mode and PWA. That work and any shipped geocoding are verified before original ticket 21's final release and original tickets 22-24's final evidence and submission sequence. Finishing polish is not a prerequisite for closing the core-deployment/decision work of ticket 16.

## Retention

Canonical public-safe evidence: this repository record. A duplicate course Drive copy is waived.

On 2026-11-01, Leo explicitly instructed: “There's no Google Drive connection, so ignore that.” This waives ticket 16's duplicate Drive-retention requirement. No upload or Drive URL is claimed. The dated repository record satisfies the retained decision proof, and ticket 16 is completed. This waiver is specific to this closeout; later presentation/submission storage requirements remain owned by their existing tickets.
