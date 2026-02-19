import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { handlePublicChat } from "@/lib/chat/handler";
import { enforcePublicChatRateLimit } from "@/lib/rate-limit/public-chat";

export async function POST(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";

  const rateLimit = await enforcePublicChatRateLimit(ip);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again shortly." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(rateLimit.reset),
        },
      },
    );
  }

  try {
    const body = (await request.json()) as {
      slug?: string;
      message?: string;
      chatId?: string;
      visitorId?: string;
    };

    const result = await handlePublicChat({
      slug: body.slug ?? "",
      message: body.message ?? "",
      chatId: body.chatId,
      visitorId: body.visitorId,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, {
      status: 200,
      headers: {
        "X-RateLimit-Remaining": String(rateLimit.remaining),
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request payload.",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
