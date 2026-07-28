# Campus Connect

Campus Connect is an IU Project: Java & Web Development course project. The product scope is pending Phase 1 tutor approval.

## Stack

SvelteKit, TypeScript, Tailwind CSS, Drizzle ORM with SQLite, Better Auth, and Bun.

## Local setup

Prerequisites: [Bun](https://bun.sh/) 1.3.14 or later.

```sh
bun install
Copy-Item .env.example .env
bun run db:migrate
bun run dev
```

Fill in `BETTER_AUTH_SECRET` in `.env` before using authentication. Keep `.env` out of version control.

## Quality checks

```sh
bun run check
bun run lint
bun run test:install # one-time Chromium download
bun run test
```

## Database

```sh
bun run db:generate # create migrations after schema changes
bun run db:migrate  # apply migrations
bun run db:studio   # inspect local data
```

## Repository notes

Use Bun for dependency management and scripts. The project is not deployed yet; Railway configuration and CI will be added before feature development begins.
