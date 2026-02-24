# Post-commit issue audit (HEAD: 2f5ec8d)

This document records issues discovered while auditing the repository after commit `2f5ec8d`.

## Reproduction commands

- `npm run lint`
- `npm run build`

## Critical issues

1. **Build is currently broken because `openai` is imported but not installed.**
   - `lib/ai/embeddings.ts` imports `openai`, but `package.json` does not include `openai` in dependencies.
   - `npm run build` fails with: `Module not found: Can't resolve 'openai'`.

2. **Cross-tenant chat session collision risk.**
   - `getOrCreateChatSession` resolves existing sessions using only `sessionId`.
   - Session IDs are client-provided in `app/api/public-chat/route.ts`; collisions across different portfolios can incorrectly re-use another portfolio's session row.
   - This can attach messages/leads to the wrong owner if session IDs are re-used or guessed.

## High-priority issues

3. **React hook lint error in new chats page (`setState` inside effect).**
   - In `app/dashboard/chats/chats-client.tsx`, an effect directly calls `setSelectedSession`.
   - Current lint config treats this as an error (`react-hooks/set-state-in-effect`).

4. **React hook lint error in lead detail page (`setState` inside effect).**
   - In `app/dashboard/leads/[id]/lead-detail-client.tsx`, an effect calls `setLead` to mark a lead as read.
   - Current lint config treats this as an error (`react-hooks/set-state-in-effect`).

5. **N+1 query pattern in chat session retrieval.**
   - `getChatSessions` loads sessions, then loops each session to fetch messages and a lead in separate queries.
   - For 20 sessions, this can become 41 queries (1 + 20 + 20), causing avoidable DB latency.

## Medium-priority issues

6. **Pagination query params are not clamped or validated.**
   - `app/api/chat-sessions/route.ts` parses `limit`/`offset` directly from URL params.
   - Negative or extreme values can create poor query plans and inconsistent behavior.

7. **Type mismatch in chat client DTOs.**
   - `chats-client.tsx` types `startedAt`, `lastMessageAt`, and `createdAt` as `Date`.
   - API JSON transports these as strings; static typing is inaccurate and can hide date parsing bugs.

## Environment-specific warnings observed

8. **Build also reported font-fetch TLS warnings/errors in this environment.**
   - These were network/TLS issues fetching Google fonts at build time.
   - They are environment-dependent but still reduce CI reliability if replicated.

