import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api/route-helpers";
import { getChatSessions, getChatSessionCount } from "@/lib/db/chat-sessions";
import { getPortfolioByUserId } from "@/lib/db/portfolio";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authResult = await requireUserId();
  if (!authResult.ok) {
    return authResult.response;
  }

  const { searchParams } = new URL(request.url);
  const rawLimit = Number.parseInt(searchParams.get("limit") || "20", 10);
  const rawOffset = Number.parseInt(searchParams.get("offset") || "0", 10);
  const limit = Number.isNaN(rawLimit) ? 20 : Math.min(Math.max(rawLimit, 1), 100);
  const offset = Number.isNaN(rawOffset) ? 0 : Math.max(rawOffset, 0);

  const portfolio = await getPortfolioByUserId(authResult.userId);
  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const [sessions, total] = await Promise.all([
    getChatSessions({ portfolioId: portfolio.id, limit, offset }),
    getChatSessionCount(portfolio.id),
  ]);

  return NextResponse.json({ sessions, total, limit, offset });
}
