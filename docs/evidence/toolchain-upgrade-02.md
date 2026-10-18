# Toolchain upgrade: built Node verification

## Scope and dependency baseline

Verification ran on 18 October 2026 in the isolated managed `toolchain-node/campus-connect` checkout, based on integration commit `85d53a9`, after ticket 01's framework migration. No production service, production database, Railway setting, or daily development build/preview was accessed. No schema or migration changed.

[Ticket 01 evidence](toolchain-upgrade-01.md) records the selected package versions, compatibility decisions, official migration review, and manual remote-form adaptations. Ticket 02 retained that exact dependency set, including Node 24.22.0, Bun 1.4.3, project Vite+ 1.0.0, Kit 3.1.0, Svelte 5.57.2, Node adapter 6.0.0, and Better Auth 1.7.10. These final Kit 3 results are separate from the earlier Kit 2 research baseline.

`Test-Path node_modules` returned `False` before installation. `vp env current` selected the declared managed Node 24.22.0 and Bun 1.4.3; `vp env exec node --version` returned `v24.22.0`. `vp install --frozen-lockfile` installed 402 packages in 51.20 seconds and ran `svelte-kit sync`. This was a real installation in a fresh checkout, with no copied dependency directory. The committed lockfile stayed unchanged with SHA256 `38D9C03904833C0EF00494D21BE47D4A0CCC577C90919224A1B340CA58D424CC`. The shell's unmanaged Node is 24.19.0, so commands use Vite+'s declared environment.

## Verification boundary

`PLAYWRIGHT_SERVER=node` selects `node build/index.js` in the existing Playwright fixture. It deliberately omits the fixture's usual build and preview commands. Migration and both existing seed CLIs still prepare a fresh temporary SQLite database, which the fixture removes on exit. The default browser suite continues using Vite preview at port 4173. Explicit Node mode uses port 4183 to keep that verification separate. No new application abstraction or alternate database fixture was introduced.

One added Group-management case captures the browser's real encoded remote-form POST after registration. It replays that exact request against `Host: internal.localhost:3000` with `Origin: https://untrusted.example`, requires 403 and Kit's `Cross-site remote requests are forbidden` response, checks that the response sets no cookie, and confirms the Group is absent from the application's directory. It then sends the same body with the configured public origin, requires success, and verifies the public-origin navigation, saved name/description after reload, and retained owner access. This distinguishes a CSRF rejection from a generic host rejection and proves the compiled public origin controls validation despite an internal Host.

The case also inspects the real registration session cookie for the public host, `/` path, future expiry, HttpOnly, SameSite=Lax, and the expected non-Secure flag on local HTTP. Existing account cases verify sessions across navigation and reload, sign-in/out, profile updates, and safe return paths. Existing public Event/Group and personal/Group Event authoring suites provide the remaining product checks.

The first draft used `internal.invalid`, which Vite's preview host guard rejected before Kit. The corrected internal localhost host reaches Kit. Another initial expectation used Kit's ordinary form error instead of its remote-form error; the observed response identified the correct remote boundary. These were test-authoring corrections; no application behavior needed a fix. The focused final case passed against preview in 15.8 seconds.

## Reproduce the standalone Node check

Run only in an isolated checkout with no server already listening on 4183. Install Chromium separately with `vp run test:install` if needed. First run `vp run quality`. Then open a fresh, disposable PowerShell session in that checkout and build once with a genuinely absent database parent and retain that artifact:

```powershell
$env:ORIGIN = 'http://127.0.0.1:4183'
$env:BETTER_AUTH_SECRET = 'test-only-secret-that-is-at-least-32-chars'
$missingDbDirectory = Join-Path ([IO.Path]::GetTempPath()) ('campus-connect-build-' + [guid]::NewGuid())
if (Test-Path -LiteralPath $missingDbDirectory) { throw 'Build database parent must be absent' }
$env:DATABASE_URL = ([uri](Join-Path $missingDbDirectory 'runtime.db')).AbsoluteUri
vp build
if ($LASTEXITCODE -ne 0) { throw 'Build failed' }
if (Test-Path -LiteralPath $missingDbDirectory) { throw 'Build created the unavailable database parent' }
$artifactBefore = Get-ChildItem build -Recurse -File | Get-FileHash | Select-Object Path, Hash
$env:PLAYWRIGHT_SERVER = 'node'
vp run test:e2e
if ($LASTEXITCODE -ne 0) { throw 'Built Node verification failed' }
$artifactAfter = Get-ChildItem build -Recurse -File | Get-FileHash | Select-Object Path, Hash
if (Compare-Object $artifactBefore $artifactAfter -Property Path, Hash) { throw 'Build artifact changed' }
Remove-Item Env:PLAYWRIGHT_SERVER, Env:DATABASE_URL, Env:ORIGIN, Env:BETTER_AUTH_SECRET
```

The Playwright fixture overrides the unavailable `DATABASE_URL` only for its migration, seed, and server subprocesses. The same artifact therefore compiles without runtime database access, then serves requests using a migrated and seeded disposable database. It binds `127.0.0.1:4183`, receives matching runtime `ORIGIN`, and stops its own server at suite completion. Do not enable Node mode without first building for that origin. Close this disposable shell after verification, including after a failed command, so its Node-mode flag and unavailable database URL cannot affect later development or quality runs.

## Results and limits

`vp run quality` exited 0. Formatting, Oxlint, Svelte-aware ESLint, and Svelte/type checking passed with zero Svelte errors or warnings. All 153 unit/browser-component tests passed across 14 files in 3.30 seconds. The preview end-to-end run passed 65 cases in 44.5 seconds, skipped only the waived case, and completed the production Node-adapter build. All eight Vite+ task steps ran with caching disabled.

The first standalone attempt compiled successfully with an absent database parent but could not start because an unrelated project's preview had just occupied 4173. Its identity was inspected read-only and that server was left untouched. Explicit Node mode now uses dedicated port 4183; default preview remains on 4173. After that configuration adjustment, `vp run lint` and `vp run check` passed again with zero Svelte errors or warnings.

The final `vp build` used `DATABASE_URL=file:///C:/Users/Leonardo%20Plata/AppData/Local/Temp/campus-connect-build-0b3b4c08-fb79-4f18-9d2f-2cd62beee3df/runtime.db` and `ORIGIN=http://127.0.0.1:4183`. Its database parent did not exist before compilation and remained absent afterward. With `PLAYWRIGHT_SERVER=node`, `vp run test:e2e` then executed `node build/index.js` against the fixture's migrated and seeded disposable database. All 65 active cases passed in 30.7 seconds with six workers, including the new origin/cookie case, all account and public browsing cases, personal/Group Event authoring, Group management, and subscriptions. Only the user-waived discovery case was skipped.

All 454 files in `build/` had identical paths and SHA256 hashes before and after that Node suite, confirming it exercised the same compiled artifact without rebuilding. No new disposable database directories remained, port 4183 had no listener, and the unavailable build-database parent still did not exist after runtime verification. The verification process removed its temporary environment values. Final documentation formatting and `git diff --check` passed. The waived Event-filtering file has no ticket 02 diff.

Non-blocking output included Vitest's mock-interceptor warning that a Vite-specific `configureServer` hook is ignored, terminal `NO_COLOR`/`FORCE_COLOR` conflicts, and Rolldown's plugin callback timing diagnostic during the full gate's build. Better Auth's invalid-password warning came from the existing negative sign-in case. No optional telemetry dependency or unrelated package was added to suppress output. The final unavailable-database build and Node suite reported no database/auth startup failures. Remote CI and live Railway verification remain unperformed.

Leo explicitly waived and disabled only `changing a filter announces loading until the new results arrive` in `src/routes/event-filtering.e2e.ts`. Ticket 02 leaves that declaration, body, and assertions untouched. Its loading/focus coverage remains inactive. Every other test remains enabled and no existing assertions or retry policy changed.

The verification uses controlled local HTTP and a configured public origin. It does not test Railway's live proxy, TLS termination, or HTTPS Secure-cookie behavior. Remote GitHub Actions has not run this branch. The deployment document records the required HTTPS cookie and proxy checks for a later separately authorized release. Better Auth continues receiving the explicit runtime base URL; Kit retains CSRF protection with no wildcard exceptions.

The README includes executable PowerShell startup for the actual Node artifact and explicitly loads `.env` using Node's `--env-file`. Deployment instructions distinguish recorded infrastructure from unverified live feature/migration state, correct Chromium's separate CI setup step, and require identical build/runtime public origins with a rebuild after origin changes. SQLite migration remains a runtime-only, separately authorized operation on Railway's `/data` volume.

Leo's current instruction permits local gitmoji commits, superseding the original ticket's no-commit condition. No push, pull request, production migration, or deployment was performed.
