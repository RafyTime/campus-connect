# Ticket 18 local validation

Validated on 2026-11-08 on branch `feat/nominatim-geocoding`.

- `vp run check`: passed with zero errors and warnings.
- `vp run lint`: formatting, lint and Svelte ESLint passed.
- `vp test --run`: 19 files, 191 tests passed.
- `PLAYWRIGHT_PORT=4273 vp run test:e2e`: production build, fresh database
  migrations and seeding succeeded. 137 browser tests passed; the added address
  journey failed because its status locator also matched the connectivity indicator.
- Scoped the test locator to the main landmark, then ran
  `PLAYWRIGHT_SERVER=node PLAYWRIGHT_PORT=4273 vp run test:e2e src/routes/event-authoring.e2e.ts -g 'address searches'`:
  passed against the existing production artifact. This includes explicit Search,
  selected address persistence and publication after the replacement provider's 503.
- `vp run test:updates`: all three PWA update tests passed.
- Initial concurrent browser/PWA verification was discarded because the builds
  collided. The completed runs above used sequential build consumers.
- Both code-review axes completed. Fixed the shared database queue being held
  during provider I/O, strengthened the failure assertion, added safe server
  diagnostics, and renamed the saved mapped-location discriminator.
- The focused concurrency test proves database work proceeds while a provider
  request is unresolved. All geocoding tests use a replacement provider.

Port 4173 was already occupied and was left untouched. Browser tests used a
disposable database and isolated application port 4273. No production service,
volume or daily preview channel was changed. Railway acceptance checks and final
screenshots/screencast remain pending in the acceptance evidence matrix.
