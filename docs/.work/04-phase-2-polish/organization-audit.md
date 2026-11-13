# Organization and navigability audit

Date: 2026-11-13. Inspected source revision: `fee222a`. Supplement to [ticket 03 audit](audit.md), following the completed design interview. Status: revised after Opus review; selected scope is recorded in the [cleanup decision](cleanup-decision.md). No source moves, deletions, application test runs or production operations were performed.

## Agreed output and constraints

Make the repository easier for a teacher and maintainers to navigate. Group product capabilities under `lib/modules/`, preserve meaningful filenames, prefer direct imports and introduce subdivisions only when they solve a concrete problem. Retain colocated unit and operation tests. Consolidate browser journeys under root `e2e/`. Separate mechanical restructuring, stale-code deletion and any deeper refactoring. Preserve all current product behavior and the existing domain glossary and ADR policies.

`modules/` was selected over `features/` and `domains/`: it names code ownership without tying folders to individual screens or implying multiple bounded contexts. These are organizational modules within the existing single context. No glossary change is needed for implementation folder names.

## Concrete friction

1. Event publication requires looking through `routes/create`, `lib/components/event-details-form.svelte`, root `lib/events.remote.ts` and `lib/event-authoring.ts`, then `lib/server/application/event-authoring.ts`. The feature is recognizable by filenames but has no common home. Groups, Participation and Location search repeat that pattern.
2. Cross-feature browser journeys and `event-form.testing.ts` are interspersed with SvelteKit routes, while the update journeys already live under `e2e/updates`. Test discovery in `playwright.config.ts` uses a global filename pattern rather than an explicit journey directory.
3. The `server/application` directory mixes accounts, discovery, authoring, Participation, Groups, geocoding and image policy. The generic layer name offers little help when asking where a capability is implemented.
4. `campus-time.ts` imports the timezone from Event authoring, making general formatting depend on specialized form policy. `remote-images.ts` combines live image constraints with demonstration portrait and intentionally missing-image constants. These are ownership questions that file moves alone cannot resolve.
5. Public Event reads also supply `postHost` and `toPublicHost` to authoring. That is a real internal dependency, but it does not require a new public Host module. Preserve the relationship initially and explain it in the module map.
6. Starter routes, greeting tests and a placeholder coexist with product code and purposeful preview fixtures. A blanket demo-directory deletion would not distinguish these roles.
7. README's current-status section still describes Participation as a later ticket and describes an older development baseline. A teacher cannot rely on that introduction as a map of the implemented application. Documentation drift should be corrected alongside the organization guide, without claiming the live deployment matches local source.

## Server-placement alternatives

Alternative A keeps shared/browser code in `lib/modules/events/` and protected operations in `lib/server/events/`. Alternative B keeps the same shared/browser code in `lib/modules/events/` and operations in `lib/modules/events/server/`. Both leave framework routes in `src/routes` and cross-cutting database infrastructure under `lib/server/db`.

**Recommend B, module-local server implementation.** The existing files already have enough behavior to justify Events, Participation, Groups, Accounts and Locations as recognizable ownership groups. Co-locating their server implementations makes following one capability more direct. Costs: deeper imports and several small `server/` folders, plus the need to explain that central `lib/server/` holds infrastructure and cross-module server policy rather than all server code. A remains reasonable if one central server tree proves easier for the intended reader.

This recommendation is supported by the installed SvelteKit implementation, `node_modules/@sveltejs/kit/src/exports/vite/utils.js`, function `is_server_only_path`: it checks project-relative `/server/` directory segments as well as `.server.*` filenames, excluding route/asset directory handling. Module-local `server/` folders therefore retain server-only import recognition in this installed version. Future implementation must verify actual build behavior; the folder name is not a substitute for testing imports. Existing `.remote.ts` files remain outside `server/` because their client-callable transformed exports are their intended interface.

### Reading tasks

The following paths describe the proposed B layout. For A, replace each `modules/<name>/server/` step with `server/<name>/`; the rest is identical. Neither option removes the need to read a route, remote function, operation and database schema. The benefit is predictable ownership, not a claimed reduction in runtime layers.

- **Publish an Event:** `routes/create/+page.svelte` and its protected server load -> `modules/events/event-details-form.svelte` -> `modules/events/events.remote.ts` -> `modules/events/server/event-authoring.ts` -> `server/db/domain.schema.ts`. Parsing stays in `modules/events/event-authoring.ts`. Authoring checks Group authorization directly against membership tables; verified Location selection is a cross-module call into Locations. Colocated authoring/lifecycle tests explain rules; `e2e/event-authoring.e2e.ts` explains the complete journey.
- **Register for an Event:** `routes/events/[eventId]/+page.svelte` -> `modules/participation/registration-controls.svelte` -> `modules/participation/participation.remote.ts` -> `modules/participation/server/participation.ts` -> the shared database schema. Event reads remain owned by Events; retained personal plans use `routes/my-activity`. Registration and Participation operation tests sit beside their implementation; the browser journey lives under `e2e/`.
- **Search for a Location:** Event form -> `modules/locations/geocoding.remote.ts` -> `modules/locations/server/geocoding.ts` -> injected provider from `modules/locations/server/geocoding-provider.ts`, plus shared cache tables. Public search result types and map rendering live in Locations. Publication calls Location selection verification, rather than trusting client coordinates. The deterministic provider and disposable cache fixtures remain test support.

These traces show why B is preferable for locality, but cannot establish that a teacher will prefer it. Review should challenge the ownership and ask whether any proposed navigation step requires undocumented knowledge.

## Proposed directory shape

```text
src/
  routes/                     # URL composition, loads, layouts and test preview routes
  lib/
    modules/
      events/                 # Event types, discovery, authoring and presentation
        server/               # Reads and publication/lifecycle operations, colocated tests
      participation/
        server/               # Interest, registration and personal-plan operations
      groups/
        server/               # Group operations and colocated tests
      accounts/
        server/               # Account operations and lazy authentication integration
      locations/
        server/               # Geocoding, provider and selection verification
    shell/                    # Navigation, appearance, connectivity, installation and updates
    shared/                   # Explicit cross-module time and presentation helpers
    components/ui/            # Existing shadcn-svelte primitives and exports
    utils.ts                  # Stable utility used by generated UI primitives
    server/
      db/                     # Existing schema, migrations, lazy DB access
      seed/                   # Public setup entry point, separated from reset fixtures later
      testing/                # DB/clock fixtures and synthetic accounts/Locations
      fixtures.ts             # Shared production/test writers until ticket 04 splits them
      group-name.ts           # Shared Group key policy used by migrations and writers
      campus-catalog.ts       # Server-consumed curated Tags and Locations
      remote-images.ts        # Cross-module server image policy
    assets/
  service-worker/             # Framework worker entry and its own TS configuration
e2e/
  *.e2e.ts                    # Existing route-level journeys, without an extra folder
  support/                    # Shared browser interactions
  updates/                    # Existing independent two-build suite
scripts/                      # Icon generation and deterministic provider process
```

Do not subdivide Events into authoring/discovery/presentation folders yet. Related filenames remain useful within the module. `shell/` is a technical area, not an additional domain. `shared/` has named owners below; it is not a destination for anything inconvenient to classify.

## Ownership and import rules

- Routes compose UI and call named remote functions; they do not become another business-operation layer. Keep existing route URLs and `+page`/`+layout` conventions.
- UI uses shared types, parsers and `.remote.ts` exports. Server operations accept existing DB/Clock/actor inputs. Do not create pass-through classes, generic repositories or mandatory TypeScript interfaces to justify the tree.
- Import directly from meaningful files, including explicit cross-module imports. Keep existing UI primitive export files; do not add a module-wide barrel exporting both browser and server code. Distinguish shared `event-authoring.ts` from `server/event-authoring.ts` through the full import path.
- Events call Locations for verified selection; Event authoring owns its direct Group-membership queries rather than calling the Groups implementation. Groups and Participation call Event reads. `events.remote.ts` imports `groups.remote.ts` to refresh Group details, and `participation.remote.ts` imports `events.remote.ts` to refresh Event reads. Keep these explicit imports traceable rather than introducing a new orchestration layer. Central DB/clock infrastructure must not acquire imports from browser code or depend on a product module for shared migration policy. Preserve intentional operation-level tests importing their operation files directly.
- Move timezone ownership into shared `campus-time.ts`, and let authoring import it. This is a small dependency correction, separately identifiable from import-only moves. Do not change the timezone or formatting behavior.
- Retain `Clock` and `systemClock` together under `lib/server/clock.ts` initially, and injected test clocks under `server/testing`. No new clock abstraction is needed.
- Put `host-avatar.svelte` and initials formatting under `shared/`. Move remote-image policy from the generic application layer to `lib/server/remote-images.ts`: it is used by Events and Groups and remains server-only without introducing a third `shared/server/` location. Retain its existing seed constants initially; separating those constants belongs to seed/test-fixture follow-up rather than changing behavior in the move.
- Retain `campus-catalog.ts` under `lib/server/`: its consumers are server authoring and seeding, and it does not need a new browser-accessible home. Keep `group-name.ts` in its current central location because migrations and all writers use it, as ADR 0002 records. Keep `fixtures.ts` in place until ticket 04 separates production initialization from test reset writers. Production seed must not acquire a dependency on `server/testing/`.
- Retain `lib/utils.ts` and the current generator utility alias. Its consumers are generated UI primitives, and moving it would rewrite those imports without improving any of the reading tasks. A coherent layout can include a documented framework/tooling exception.

## Complete disposition

The [per-file mapping](organization-file-map.md) accounts for every tracked file under `src/`, `e2e/` and `scripts/` at the reviewed revision. It includes files left in place and deletion candidates. It describes destinations, not executed moves. Tests beside server operations follow the operations, including lifecycle, Group Event authoring and registration tests whose filenames differ from their implementation owner.

### Stale and ambiguous items

- **Remove candidate:** all `src/routes/demo/` files. Search finds internal demo links and redirects, but no current application journey uses them. They add a second auth implementation. Confirm no submission document intentionally depends on those URLs before deletion.
- **Remove candidate:** `src/lib/vitest-examples/`, whose greeting implementation and greeting tests reference each other without product consumers. Retain actual product tests. Confirm test-project discovery still succeeds after removal.
- **Remove candidate:** `destination-placeholder.svelte`, with no source consumer found. The empty `lib/index.ts` only contains starter guidance; remove its unused `#lib` package mapping at the same time if repository-wide import search confirms no bare alias consumers. Do not remove the `#lib/*` mapping.
- **Retain:** `routes/preview/`, explicitly referenced by public-shell/public-Events/public-Groups tests for loading, server failure, empty views and failed images. Their route names must remain stable during this behavior-preserving move. Whether to exclude fixtures from production is a separate delivery decision, not an automatic consequence of placing tests elsewhere.
- **Retain:** `components/ui/` and its export files. No unused-library purge is justified here; future generator updates and actual consumers need separate consideration.
- **Retain:** `scripts/generate-app-icons.py`, generated static icons, committed migrations and schema files. These have reproducibility or deployment roles, not starter-example roles.
- **Investigate:** synthetic content and deliberately missing images in public seeding, currently shared with tests. Ticket 04 owns safe setup and test-fixture separation; 08/09 own final public content. Do not delete fixture constants just because they look artificial.

## Test relevance extension

Added at Leo's request during this audit. A test earns its place by detecting a failure of a current requirement or a necessary verification facility. Existing passing assertions are not themselves proof of relevance. The dispositions below come from source/assertion inspection; no mutation testing, runtime measurement or fresh test run was performed. They are suite-level dispositions with concrete case-level exceptions, not a claim to have proved the value of every individual assertion.

| Current suite or group                                                                            | Disposition and reason                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vitest-examples/greet.spec.ts`, `Welcome.svelte.spec.ts`                                         | Remove candidates with their unused greeting implementation. They verify framework examples, not Campus Connect requirements. The latter is the only current browser-component test; remove the now-empty client Vitest project and its unused browser-component dependencies after checking all remaining consumers. Do not add an artificial replacement test to keep that project populated.          |
| `server/testing/clock.spec.ts`                                                                    | Optional removal candidate: its single test checks initial/set instants on a tiny assignment-based helper, already used by substantive lifecycle tests. Low maintenance cost makes retention harmless; deletion is not a priority. Do not generalize this to deleting the controllable clock itself.                                                                                                     |
| `server/testing/database.spec.ts`                                                                 | Retain. It proves separately created test databases cannot observe each other's data. That isolation property is necessary for the reliability of many operation tests and is not proved merely by having many consumers.                                                                                                                                                                                |
| `server/db/index.spec.ts`                                                                         | Retain. The mock assertion of no connection on import expresses ADR 0001's build-time constraint, rather than an arbitrary implementation arrangement. The accompanying function-type assertion is weak but does not invalidate the test.                                                                                                                                                                |
| `server/db/migrate.spec.ts`                                                                       | Retain. Empty setup, collision handling, backfill preservation, safe reruns and rejection of untracked existing tables protect migration behavior and ADR 0002.                                                                                                                                                                                                                                          |
| `application/accounts.spec.ts`, `authentication-logging.spec.ts`                                  | Retain. Input/return-path rules and payload-free logging under a real session-write failure remain current. Mocked log capture observes an externally relevant confidentiality rule.                                                                                                                                                                                                                     |
| `application/events.spec.ts`, `event-discovery.spec.ts`                                           | Retain. They check ordering, filtering, visibility, detail/history, coordinates and image constraints. Stable seeded examples may need fixture updates after ticket 04, not deletion of the requirements.                                                                                                                                                                                                |
| `application/event-authoring.spec.ts`, `group-event-authoring.spec.ts`, `event-lifecycle.spec.ts` | Retain. They exercise authorized creation/editing, host ownership, Participation locks, exact end, cancellations and preservation. Do not remove Group cases as duplicates of personal authoring: their authorization differs.                                                                                                                                                                           |
| `application/participation.spec.ts`, `registration.spec.ts`                                       | Retain. Idempotence, response modes, capacity competition, retained history and persistence failure differ materially. Trigger-based persistence failure tests check failed operations leave existing Participation intact.                                                                                                                                                                              |
| `application/groups.spec.ts`, `group-transactions.spec.ts`                                        | Retain the suites with four case-removal candidates detailed below. Two operation helpers have only test callers; their tests do not protect the active product. Retain direct database constraints, current-operation behavior and concurrency coverage.                                                                                                                                                |
| `application/geocoding.spec.ts`                                                                   | Retain. Normalization/cache, anonymous rejection, filtering, provider failure, selection verification and global concurrency constraints protect current Location behavior.                                                                                                                                                                                                                              |
| `server/seed.spec.ts`                                                                             | Revise/extend in ticket 04. Stable record counts are useful for repeat-initialization uniqueness but do not prove preservation of edits. Literal taxonomy IDs and seeded Event lists describe the current fixture catalog; move/update those expectations when public content and test fixtures separate. Do not preserve old demo content merely to keep these expectations green.                      |
| `accounts`, `group-management`, `group-follow`, `public-groups` browser suites                    | Retain. They validate current UI journeys and protected actions, not just operation results. Distinct visitors, subscribers and managers must remain represented.                                                                                                                                                                                                                                        |
| `public-events`, `event-filtering`, `event-authoring`, `group-event-authoring` browser suites     | Retain. Visible discovery, validation, publication, address selection and previews cover browser integration absent from operation tests. Update fixtures and import paths when moved.                                                                                                                                                                                                                   |
| `participation`, `registration`, `event-lifecycle` browser suites                                 | Retain; adapt plan/navigation assertions for ticket 06. Viewport variants verify usability in different layouts; they are not automatically redundant because the business operation is the same.                                                                                                                                                                                                        |
| `public-shell`, `core-quality`, `event-maps` browser suites                                       | Retain. First-paint theme, installation, navigation/focus, accessibility/bounds and map failure remain agreed behavior. Some map assertions name provider style/zoom; these reflect the current accepted map contract. Revisit them if that contract changes, rather than treating all provider-specific assertions as implementation-only.                                                              |
| `core-journeys.e2e.ts`                                                                            | Retain the two cross-feature journeys for now. They connect authentication, discovery, following, publication and personal activity beyond isolated suites. Publication journeys are already delegated to the dedicated authoring suites. Further consolidation requires identifying the same scenario, failure signal and platform coverage elsewhere; no measured runtime case for pruning is claimed. |
| `core-security.e2e.ts`                                                                            | Retain the password/session-token and HttpOnly checks. Investigate the email non-disclosure assertion separately: an email address is personal data but not an authentication credential, and the requirement should say whether exposing one's own email is forbidden. Do not remove the whole test because its title conflates those concerns.                                                         |
| `offline-updates.e2e.ts`, `e2e/updates/pwa.spec.ts`                                               | Retain. Ordinary offline/reconciliation behavior and real service-worker activation across two builds exercise different failure modes. Tags-only and pre-hydration edits protect independent input-detection paths, not repeated smoke coverage.                                                                                                                                                        |

No broad removal of production behavior suites is supported by this pass. Greeting examples and four obsolete or redundant Group cases have concrete removal evidence. The strongest revision need is seed expectations tied to the old catalog. Test-helper assignment checks and the email non-disclosure rule deserve explicit decisions. Keep any test deletion/revision separate from path moves, name the requirement or replacement evidence, and do not expand a mechanical restructure into rewriting the test harness.

## Documentation and implementation handoff

### Confirmed Group test and helper removal candidates

Repository reference search confirms `recordGroupMembership` and `assertGroupMutable` in `server/application/groups.ts` have only test callers. Remove the helpers and their now-unneeded result types if a final reference check confirms they remain unused. Remove the two `groups.spec.ts` tests named "rejects a second membership for the same User and Group" and "rejects a second owner for the same Group" that exercise the first helper. Retain the direct database constraint tests, which protect every writer, including the actual create/follow operations.

The "blocks ordinary Users from editing the system-managed Campus Updates Group" test only calls `assertGroupMutable`. The real `editGroup` behavior is already covered by "returns explicit results for missing and system-managed Groups". Removing the unused helper and its test leaves the actual requirement represented.

The `groups.spec.ts` test "rolls back Group creation when the owner membership cannot be inserted" repeats the failed missing-user creation scenario in `group-transactions.spec.ts`, "leaves neither a Group nor a membership after failed owner insertion". The latter runs against both memory and file-backed SQLite and additionally checks memberships remain empty. Retain the stronger transaction test and remove the redundant Groups copy. These are four case-removal candidates total, not a recommendation to delete either Group suite. Delete them with their obsolete helpers in a separate verified cleanup unit, not during import-only moves.

Unused exports from seed helpers and `parseGroupDetails` are lower-priority visibility cleanup candidates. Review callers again during ticket 04 or the selected cleanup; do not create a separate module just to reduce exported names.

Update README and the source-layout sketch in docs/agents/domain.md with a source-verified capability summary where appropriate, the short directory map and links to the glossary, ADRs and a concise architecture guide. The guide should contain the three reading tasks above, remote-function/server-operation responsibilities, direct-import rules, tests and disposable-data setup. Keep detailed per-file migration bookkeeping in the work tracker; the permanent guide should explain stable concepts rather than duplicate every filename. Update existing evidence links affected by moves without rewriting historical verification claims.

Suggested independently reviewable implementation units:

1. Move E2E journeys directly under e2e/ and the helper under e2e/support/, set explicit `testDir` and `testMatch`, preserve the independent updates config and ensure no duplicate discovery of its `.spec.ts` files. Update helper imports and root references. TypeScript already includes `e2e`; verify that unit/component discovery remains separate.
2. Move retained library files according to the selected map, keeping function bodies and behavior unchanged. Update direct imports, package/CLI references, service-worker offline-page import, auth generation path and relevant documentation links. Update the source-key lookup in the map browser test, which currently indexes the Vite manifest by src/lib/components/event-map.ts. Keep the generated UI utility alias unchanged. Database runtime/build policy and Unicode Group keys must survive every writer move. Do not move the Drizzle schema or committed migrations in this unit.
3. Make the small timezone ownership correction, preserving values and behavior. Other deeper refactors remain separate candidates requiring selection, not prerequisites for a navigable layout.
4. Delete confirmed starter leftovers and obsolete Group helpers/tests in separate commits, then refresh the permanent documentation. Removing the only browser-component test also requires reviewing the client Vitest project and unused vitest-browser-svelte and @vitest/browser-playwright dependencies together. Keep Playwright browser E2E infrastructure and the server Vitest project. Seed-content cleanup remains its own workstream.

Run the repository quality gate for source restructuring: formatting/lint, Svelte/TS including worker, unit/operation tests, built browser journeys, two-build update journeys and production build. Use the existing isolated disposable setup, not a daily preview or live DB. Check renamed test discovery explicitly and verify client imports cannot pull a module's server implementation into browser code. Do not write tests asserting paths, private controller state or arbitrary file counts.

This audit supplies the organization input for ticket 05. The later [cleanup decision](cleanup-decision.md) records accepted scope, ticket 07's bounded implementation and tickets 11-14. The earlier bounded cleanup candidates remain explicitly deferred, and the map Retry behavior risk has its own bug ticket. No technical folder names belong in the domain glossary. The accepted reversible organization does not require a new ADR; retain existing initialization and Group-name policies.

## Review status

Opus completed its read-only challenge against `fee222a` and the first draft. It confirmed all 279 file dispositions were present without destination collisions, module-local server protection, remote-file placement, and the main organization direction. The parent checked the Group helper references, duplicate rollback scenario, manifest-key lookup and utility consumers before incorporating these corrections:

- Retain production fixture writers, Group-key policy, the campus catalog and generated UI utilities in their existing locations. Move only the cross-module image policy out of the generic application layer into the central server area. This avoids a production dependency on testing, a migration dependency on a product module, reduced server protection and unnecessary generated-file changes.
- Correct the actual dependency directions and add the map test's Vite manifest key to migration work. Treat the only browser-component test, its client project and unused dependencies as one coordinated deletion decision.
- Record the two unused Group helpers, three helper-only cases and the redundant rollback case. The earlier blanket rationale for retaining Group operation-conflict tests did not hold for helpers with no product callers.
- Flatten browser journeys directly under `e2e/`; `support/` and `updates/` still have specific purposes. Refresh the domain-doc layout sketch as well as README.

No material review objection remains unaddressed in the proposal. This is parent reconciliation, not a second Opus approval of the revised documents. Leo subsequently accepted the recommended scope through ticket 05; see the cleanup decision. The low-priority clock-helper test and the email non-disclosure rule remain explicitly investigatory; no deletion is authorized by the audit itself.
