import { eq, desc, and, sql } from "drizzle-orm";
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

export async function getChatSessionBySessionId(sessionId: string) {
  const [session] = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.sessionId, sessionId))
    .limit(1);
  return session || null;
}

export async function getOrCreateChatSession(input: CreateChatSessionInput) {
  const existing = await getChatSessionBySessionId(input.sessionId);
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

  const sessionsWithMessages = await Promise.all(
    sessions.map(async (session) => {
      const messages = await getChatMessagesBySessionId(session.id);
      
      const [lead] = await db
        .select({
          id: agentLeads.id,
          name: agentLeads.name,
          email: agentLeads.email,
          status: agentLeads.status,
          confidence: agentLeads.confidence,
        })
        .from(agentLeads)
        .where(eq(agentLeads.sessionId, session.id))
        .limit(1);

      return {
        ...session,
        messages,
        lead: lead || null,
      };
    })
  );

  return sessionsWithMessages;
}

export async function getChatSessionCount(portfolioId: string) {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(chatSessions)
    .where(eq(chatSessions.portfolioId, portfolioId));
  return result?.count ?? 0;
}
