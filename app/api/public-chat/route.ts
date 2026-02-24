import { NextResponse } from "next/server";
import { generateAgentReply } from "@/lib/ai/generate-agent-reply";
import {
  isHandleTemporarilyBlocked,
  markHandleAiFailure,
  markHandleAiSuccess,
} from "@/lib/ai/failure-guard";
import { classifyAiError, logPublicAgentEvent } from "@/lib/ai/safe-logging";
import { saveLeadWithDedup } from "@/lib/db/agent-leads";
import {
  getPublishedPortfolioWithAgentByAgentId,
  getPublishedPortfolioWithAgentByHandle,
} from "@/lib/db/portfolio";
import { isBehaviorPresetType } from "@/lib/agent/behavior-presets";
import { isSupportedAgentModel } from "@/lib/agent/models";
import {
  isConversationStrategyMode,
  leadConfidenceThresholdForMode,
  type ConversationStrategyMode,
} from "@/lib/agent/strategy-modes";
import {
  checkPublicChatAgentRateLimit,
  checkPublicChatHandleRateLimit,
  checkPublicChatIpRateLimit,
} from "@/lib/rate-limit";
import { validatePortfolioContent } from "@/lib/validation/portfolio-schema";
import { parsePublicChatRequest } from "@/lib/validation/public-chat";
import { trackAnalytics } from "@/lib/db/analytics";
import { consumeCredits, getCredits } from "@/lib/credits";
import { requireUserId } from "@/lib/api/route-helpers";
import { getOrCreateChatSession, createChatMessage } from "@/lib/db/chat-sessions";

const CREDIT_COST = 1;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}


function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!origin || !appOrigin || origin !== appOrigin) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS(request: Request) {
  const corsHeaders = getCorsHeaders(request);
  if (!("Access-Control-Allow-Origin" in corsHeaders)) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown> | null = null;
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      try {
        const text = await request.text();
        body = text?.trim() ? (JSON.parse(text) as Record<string, unknown>) : null;
      } catch {
        body = null;
      }
    }
    const parsed = parsePublicChatRequest(body);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const ip = getClientIp(request);
    if (!checkPublicChatIpRateLimit(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    if (parsed.handle && !checkPublicChatHandleRateLimit(parsed.handle)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    if (parsed.agentId && !checkPublicChatAgentRateLimit(parsed.agentId)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    if (parsed.handle && isHandleTemporarilyBlocked(parsed.handle)) {
      return NextResponse.json(
        { reply: "Agent temporarily unavailable. Please try again later." },
        { status: 200 }
      );
    }

    const authResult = await requireUserId();
    const userId = authResult.ok ? authResult.userId : null;
    
    if (userId) {
      const currentCredits = await getCredits(userId);
      if (currentCredits < CREDIT_COST) {
        return NextResponse.json({ error: "Not enough credits" }, { status: 402 });
      }
    }

    const portfolio = parsed.agentId
      ? await getPublishedPortfolioWithAgentByAgentId(parsed.agentId)
      : await getPublishedPortfolioWithAgentByHandle(parsed.handle ?? "");

    if (!portfolio || !portfolio.content) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    if (!portfolio.agentId || !portfolio.agentIsEnabled || !portfolio.agentModel) {
      return NextResponse.json({ error: "Agent unavailable" }, { status: 404 });
    }

    if (!isSupportedAgentModel(portfolio.agentModel)) {
      return NextResponse.json({ error: "Agent model misconfigured" }, { status: 500 });
    }

    if (
      typeof portfolio.agentTemperature !== "number" ||
      portfolio.agentTemperature < 0.2 ||
      portfolio.agentTemperature > 0.8
    ) {
      return NextResponse.json({ error: "Agent temperature misconfigured" }, { status: 500 });
    }

    const content = validatePortfolioContent(portfolio.content);
    const behaviorType =
      portfolio.agentBehaviorType && isBehaviorPresetType(portfolio.agentBehaviorType)
        ? portfolio.agentBehaviorType
        : null;

    const strategyMode: ConversationStrategyMode =
      portfolio.agentStrategyMode && isConversationStrategyMode(String(portfolio.agentStrategyMode))
        ? (String(portfolio.agentStrategyMode) as ConversationStrategyMode)
        : "consultative";

    const result = await generateAgentReply({
      agentId: portfolio.agentId,
      model: portfolio.agentModel,
      temperature: portfolio.agentTemperature,
      behaviorType,
      strategyMode,
      customPrompt: portfolio.agentCustomPrompt,
      message: parsed.message,
      history: parsed.history,
      portfolio: content,
    });

    if (userId) {
      await consumeCredits(userId, CREDIT_COST);
    }

    const threshold = leadConfidenceThresholdForMode(strategyMode);
    const leadDetected =
      strategyMode !== "passive" && result.lead.lead_detected && result.lead.confidence >= threshold;

    const sessionId = parsed.sessionId || crypto.randomUUID();
    const isFirstMessage = !parsed.history || parsed.history.length === 0;
    
    let chatSessionDbId = null;
    if (isFirstMessage) {
      await trackAnalytics({
        portfolioId: portfolio.id,
        type: "chat_session_start",
        sessionId,
      });
      
      const chatSession = await getOrCreateChatSession({
        portfolioId: portfolio.id,
        sessionId,
        visitorId: ip,
        country: undefined,
        deviceInfo: request.headers.get("user-agent") || undefined,
      });
      chatSessionDbId = chatSession.id;
    } else {
      const existingSession = await getOrCreateChatSession({
        portfolioId: portfolio.id,
        sessionId,
        visitorId: ip,
        country: undefined,
        deviceInfo: request.headers.get("user-agent") || undefined,
      });
      chatSessionDbId = existingSession.id;
    }

    if (chatSessionDbId) {
      await createChatMessage({
        sessionId: chatSessionDbId,
        role: "user",
        content: parsed.message,
        isFromVisitor: true,
      });

      await createChatMessage({
        sessionId: chatSessionDbId,
        role: "assistant",
        content: result.reply,
        isFromVisitor: false,
      });
    }
    
    await trackAnalytics({
      portfolioId: portfolio.id,
      type: "chat_message",
      sessionId,
    });

    if (leadDetected) {
      const dedupeResult = await saveLeadWithDedup({
        portfolioId: portfolio.id,
        sessionId: chatSessionDbId || undefined,
        name: result.lead.lead_data?.name?.trim() || null,
        email: result.lead.lead_data?.email?.trim() || null,
        budget: result.lead.lead_data?.budget?.trim() || null,
        projectDetails: result.lead.lead_data?.project_details?.trim() || null,
        confidence: result.lead.confidence,
      });

      if (dedupeResult === "updated") {
        console.info(
          JSON.stringify({
            event: "agent_lead_updated",
            handle: portfolio.handle,
            portfolioId: portfolio.id,
            timestamp: new Date().toISOString(),
          })
        );
      }
    }

    if (parsed.handle) {
      if (result.errorType) {
        markHandleAiFailure(parsed.handle);
      } else {
        markHandleAiSuccess(parsed.handle);
      }
    }

    logPublicAgentEvent({
      handle: portfolio.handle,
      model: portfolio.agentModel,
      tokensUsed: result.usage.totalTokens,
      leadDetected,
      confidence: result.lead.confidence,
      errorType: result.errorType,
    });

    return NextResponse.json({ reply: result.reply, leadDetected, sessionId }, { headers: getCorsHeaders(request) });
  } catch (error) {
    const errorType = classifyAiError(error);
    console.error(
      JSON.stringify({
        event: "public_chat_route_error",
        error_type: errorType,
        timestamp: new Date().toISOString(),
      })
    );

    return NextResponse.json(
      {
        reply:
          "Thanks for your message. Please leave your email and project details and the professional will get back to you shortly.",
        leadDetected: false,
      },
      { status: 200 }
    );
  }
}
