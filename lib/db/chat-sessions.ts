import { eq, desc, sql, inArray, asc, isNotNull } from "drizzle-orm";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { chatSessions, chatMessages, agentLeads } from "@/lib/schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const sqlConn = postgres(databaseUrl, { prepare: false });
const db = drizzle(sqlConn);

interface CreateChatSessionInput {
  portfolioId: string;
  sessionId: string;
  visitorId?: string;
  country?: string;
  deviceInfo?: string;
}

export async function createChatSession(input: CreateChatSessionInput) {
  const [session] = await db.insert(chatSessions).values({
    id: crypto.randomUUID(),
    portfolioId: input.portfolioId,
    sessionId: input.sessionId,
    visitorId: input.visitorId || null,
    country: input.country || null,
    deviceInfo: input.deviceInfo || null,
    startedAt: new Date(),
    lastMessageAt: new Date(),
  }).returning();
  return session;
}

interface CreateChatMessageInput {
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  isFromVisitor: boolean;
}

export async function createChatMessage(input: CreateChatMessageInput) {
  const [message] = await db.insert(chatMessages).values({
    id: crypto.randomUUID(),
    sessionId: input.sessionId,
    role: input.role,
    content: input.content,
    isFromVisitor: input.isFromVisitor,
    createdAt: new Date(),
  }).returning();

  await db.update(chatSessions)
    .set({ lastMessageAt: new Date() })
    .where(eq(chatSessions.id, input.sessionId));

  return message;
}

export async function getChatSessionByPortfolioAndSessionId(
  portfolioId: string,
  sessionId: string
) {
  const [session] = await db
    .select()
    .from(chatSessions)
    .where(
      sql`${chatSessions.portfolioId} = ${portfolioId} and ${chatSessions.sessionId} = ${sessionId}`
    )
    .limit(1);
  return session || null;
}

export async function getOrCreateChatSession(input: CreateChatSessionInput) {
  const existing = await getChatSessionByPortfolioAndSessionId(input.portfolioId, input.sessionId);
  if (existing) {
    return existing;
  }
  return createChatSession(input);
}

export async function getChatMessagesBySessionId(sessionId: string) {
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt);
}

interface GetChatSessionsInput {
  portfolioId: string;
  limit?: number;
  offset?: number;
}

export async function getChatSessions(input: GetChatSessionsInput) {
  const { portfolioId, limit = 20, offset = 0 } = input;

  const sessions = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.portfolioId, portfolioId))
    .orderBy(desc(chatSessions.lastMessageAt))
    .limit(limit)
    .offset(offset);

  if (sessions.length === 0) {
    return [];
  }

  const sessionIds = sessions.map((session) => session.id);

  const [messages, leads] = await Promise.all([
    db
      .select()
      .from(chatMessages)
      .where(inArray(chatMessages.sessionId, sessionIds))
      .orderBy(asc(chatMessages.createdAt)),
    db
      .select({
        id: agentLeads.id,
        sessionId: agentLeads.sessionId,
        name: agentLeads.name,
        email: agentLeads.email,
        status: agentLeads.status,
        confidence: agentLeads.confidence,
      })
      .from(agentLeads)
      .where(sql`${isNotNull(agentLeads.sessionId)} and ${inArray(agentLeads.sessionId, sessionIds)}`),
  ]);

  const messagesBySessionId = new Map<string, typeof messages>();
  for (const message of messages) {
    const current = messagesBySessionId.get(message.sessionId) ?? [];
    current.push(message);
    messagesBySessionId.set(message.sessionId, current);
  }

  const leadBySessionId = new Map<string, (typeof leads)[number]>();
  for (const lead of leads) {
    if (lead.sessionId && !leadBySessionId.has(lead.sessionId)) {
      leadBySessionId.set(lead.sessionId, lead);
    }
  }

  const sessionsWithMessages = sessions.map((session) => {
    const lead = leadBySessionId.get(session.id);

    return {
      ...session,
      messages: messagesBySessionId.get(session.id) ?? [],
      lead: lead
        ? {
            id: lead.id,
            name: lead.name,
            email: lead.email,
            status: lead.status,
            confidence: lead.confidence,
          }
        : null,
    };
  });

  return sessionsWithMessages;
}

export async function getChatSessionCount(portfolioId: string) {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(chatSessions)
    .where(eq(chatSessions.portfolioId, portfolioId));
  return result?.count ?? 0;
}
