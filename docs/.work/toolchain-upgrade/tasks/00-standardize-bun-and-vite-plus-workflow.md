# 00: Standardize the Bun and Vite+ workflow

**What to build:** A reproducible development and CI workflow in which a developer can install Campus Connect from its lockfile, run the application, and execute the complete quality gate with Bun 1.4.3 and Vite+. Finish the setup already present while preserving the current application behavior and framework-specific checks.

**Blocked by:** None (can start immediately).

**Status:** ready

**Category:** enhancement

## Acceptance criteria

- [ ] Bun 1.4.3 remains the declared package manager and the version used for installation and existing Bun utility scripts. One supported stable Node 24 patch version is declared consistently for local development and CI and satisfies the selected Vite+ requirements.
- [ ] A real clean installation succeeds with the frozen lockfile and declared runtimes in an isolated checkout or temporary copy. It does not change the lockfile, rely on copied installed dependencies, or access a production database.
- [ ] Vite+, its direct Vite core alias and override, Vitest, and its browser provider resolve to a compatible aligned toolchain. Retain the existing project Vite+ release unless a verified compatibility requirement justifies changing it; record any such change and its reason.
- [ ] The documented workflow uses Vite+ for dependency management, development, preview, formatting, linting, testing, builds, and project tasks. It clearly distinguishes built-in commands from custom tasks and identifies the complete quality command.
- [ ] Svelte formatting, Svelte-aware template linting, and Svelte/type checking remain enforced alongside Oxlint and Oxfmt. Unit/component tests and end-to-end tests remain part of the complete quality gate.
- [ ] CI uses the official Vite+ setup integration pinned to an exact release or commit, the selected Node runtime, Bun 1.4.3, frozen-lockfile installation, Chromium setup, and the complete quality gate. Existing workflow triggers and deployment gate semantics are preserved.
- [ ] The complete quality gate passes with the declared runtimes against the existing Kit 2 application. Developer setup instructions and verification evidence describe the resulting commands, selected versions, and any remaining warnings.

## Implementation tasks

- [ ] Review the existing setup before editing it. Establish and record the baseline; preserve dependency alignment and useful checks rather than run a full tooling migration blindly.
- [ ] Declare the project Node runtime, align CI setup, and standardize task invocation and developer instructions. Preserve direct Bun use for existing database utilities and Node use for application startup.
- [ ] Verify clean installation and run all applicable quality checks in isolation. Explain remaining warnings without adding unrelated dependencies or weakening checks.
- [ ] Record whether CI itself was executed or only its equivalent commands were verified locally. Do not claim a remote CI result from a local run.

## Comments

Parent: [Campus Connect toolchain upgrade](../spec.md).

Bun 1.4.3 and project Vite+ 1.0.0 were configured before this ticket. The 14 October 2026 review passed a frozen-lockfile installation dry run, formatting, linting, Svelte/type checking, 153 unit/component tests, 65 end-to-end tests, and a production build in an isolated copy. A real clean installation remains required. Local Node selected 24.21.0 while CI declared 24.19.0; these are baseline observations rather than target-version decisions.

The local `ready` status represents `ready-for-agent`. Preserve ADR 0001's lazy database/authentication initialization and ADR 0002's Unicode Group name uniqueness. Production, its database, the daily development preview, commits, pushes, and pull requests remain outside authorization. Stateful database operations and browser suites must not gain task caching through this ticket.
