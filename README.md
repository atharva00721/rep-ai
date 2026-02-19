# preffer.me foundation

Production-ready multi-tenant AI SaaS foundation using Next.js App Router, Neon Postgres, Drizzle ORM, BetterAuth, and Upstash Redis.

## Stack

- Next.js 16 + TypeScript
- Neon Postgres (`@neondatabase/serverless`)
- Drizzle ORM + Drizzle Kit
- BetterAuth (auth bootstrap)
- Upstash Redis + Ratelimit
- External LLM API integration

## Project structure

```txt
app/
  (marketing)/page.tsx
  (dashboard)/dashboard/page.tsx
  [slug]/page.tsx
  api/chat/route.ts
lib/
  ai/service.ts
  chat/handler.ts
  credits/service.ts
  db/client.ts
  db/schema.ts
  db/migrations/0000_initial.sql
  leads/service.ts
  rate-limit/public-chat.ts
  auth.ts
drizzle.config.ts
```

## Environment variables

```bash
DATABASE_URL=
LLM_API_KEY=
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_MODEL=gpt-4o-mini
CREDIT_PER_TOKEN=1
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
BETTER_AUTH_URL=
BETTER_AUTH_SECRET=
```

## Database + migration setup

1. Generate migration files:

```bash
npm run db:generate
```

2. Apply migrations:

```bash
npm run db:migrate
```

The initial SQL migration is included at `lib/db/migrations/0000_initial.sql`.

## Chat pipeline

`POST /api/chat`

1. Rate limit by IP via Upstash.
2. Validate request payload.
3. Load active profile by slug + owner credits.
4. Build dynamic AI system prompt from profile fields.
5. Fetch recent chat history.
6. Call external LLM API.
7. Insert user + assistant messages.
8. Atomically deduct credits + write usage log in one DB transaction.

## Credit consistency

`deductCreditsAndLogUsageWithTx` performs conditional update:

- `WHERE users.credits_remaining >= credits_to_deduct`
- If no row updated, throws `InsufficientCreditsError`.
- Usage log is inserted in same transaction.

This is race-safe across concurrent serverless invocations.

## Scaling notes for 10k+ users

- Add read replicas for analytics/read-heavy endpoints.
- Move long-running AI calls to queue workers (e.g., Inngest/QStash).
- Add Redis response cache for repeated prompt prefixes + profile fetches.
- Partition `usage_logs` by month for cheaper analytics and faster retention ops.
- Introduce background summarization to keep chat context short and cheap.
- Extract `lib/ai/service.ts` into dedicated AI gateway service once model routing grows.
- Add observability: request IDs, OpenTelemetry tracing, per-tenant cost dashboards.
