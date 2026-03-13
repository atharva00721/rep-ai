# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Mimick.me (Rep AI) — a Next.js 16 full-stack app (TypeScript, Bun, Drizzle ORM, PostgreSQL) that lets users create AI portfolio sites with conversational agents for lead generation.

### Services

| Service | How to run | Notes |
|---|---|---|
| Next.js dev server | `bun dev` | Runs on port 3000. Hot-reloads. |
| PostgreSQL | `sudo pg_ctlcluster 16 main start` | Local instance with SSL enabled (required by the app's `ssl: "require"` option). DB name: `repai`, user: `postgres`, password: `postgres`. |

### Key commands

See `package.json` scripts. Summary:
- **Dev**: `bun dev`
- **Build**: `bun run build`
- **Lint**: `bun lint` (pre-existing warnings/errors in the codebase; exit code 1 is expected)
- **DB push**: `bun db:push` (pushes Drizzle schema to the database)
- **DB migrate**: `bun db:migrate`

### Environment variables

A `.env.local` file is required. Critical vars:
- `DATABASE_URL` — PostgreSQL connection string (local: `postgres://postgres:postgres@127.0.0.1:5432/repai`)
- `AUTH_SECRET` — random 32-byte hex string for session encryption
- `DODO_PAYMENTS_API_KEY` — required at build time (module-level DodoPayments instantiation); use a dummy value if billing features aren't needed

Optional for full feature parity: `NEBIUS_API_KEY`, `AI_GATEWAY_API_KEY`, `S3_*`, `GOOGLE_CLIENT_ID/SECRET`, `TAVILY_API_KEY`, `QSTASH_TOKEN`, `EMAIL_USER/PASS`.

### Gotchas

- The `lib/db/index.ts` uses `ssl: "require"` — local PostgreSQL must have SSL enabled or DB connections will fail at runtime.
- `DODO_PAYMENTS_API_KEY` is evaluated at module import time in billing routes; even a dummy value allows the build to succeed.
- The `bun lint` command exits with code 1 due to pre-existing lint errors (44 errors, 110 warnings). This is the expected baseline.
- The app uses `better-auth` (not NextAuth). Auth endpoints are at `/api/auth/[...all]`.
- Google OAuth warnings during build are harmless when `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are not set.
