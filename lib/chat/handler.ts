import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { generateAiReply, buildProfileSystemPrompt, type LlmMessage } from "@/lib/ai/service";
import { deductCreditsAndLogUsageWithTx, InsufficientCreditsError } from "@/lib/credits/service";
import { db } from "@/lib/db/client";
import { chats, messages, profiles, users } from "@/lib/db/schema";

const chatRequestSchema = z.object({
  slug: z.string().min(2).max(80),
  message: z.string().min(1).max(4000),
  chatId: z.string().uuid().optional(),
  visitorId: z.string().uuid().optional(),
});

const CREDIT_PER_TOKEN = Number(process.env.CREDIT_PER_TOKEN ?? "1");

export type PublicChatInput = z.infer<typeof chatRequestSchema>;

export async function handlePublicChat(input: PublicChatInput) {
  const parsed = chatRequestSchema.parse(input);

  const [profile] = await db
    .select({
      id: profiles.id,
      userId: profiles.userId,
      slug: profiles.slug,
      bio: profiles.bio,
      services: profiles.services,
      pricingInfo: profiles.pricingInfo,
      tone: profiles.tone,
      aiInstructions: profiles.aiInstructions,
      isActive: profiles.isActive,
      ownerCredits: users.creditsRemaining,
    })
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(and(eq(profiles.slug, parsed.slug), eq(profiles.isActive, true)))
    .limit(1);

  if (!profile) {
    return { ok: false as const, status: 404, error: "Profile not found." };
  }

  if (profile.ownerCredits <= 0) {
    return { ok: false as const, status: 402, error: "Credits exhausted." };
  }

  const history = parsed.chatId
    ? await db
        .select({ role: messages.role, content: messages.content })
        .from(messages)
        .innerJoin(chats, eq(messages.chatId, chats.id))
        .where(and(eq(messages.chatId, parsed.chatId), eq(chats.profileId, profile.id)))
        .orderBy(desc(messages.createdAt))
        .limit(12)
    : [];

  const orderedHistory: LlmMessage[] = history
    .reverse()
    .map((item) => ({ role: item.role, content: item.content }));

  const aiMessages: LlmMessage[] = [
    { role: "system", content: buildProfileSystemPrompt(profile) },
    ...orderedHistory,
    { role: "user", content: parsed.message },
  ];

  const completion = await generateAiReply(aiMessages);

  const totalTokens = completion.inputTokens + completion.outputTokens;
  const creditsToDeduct = Math.max(1, Math.ceil(totalTokens * CREDIT_PER_TOKEN));

  try {
    const result = await db.transaction(async (tx) => {
      const chatId = parsed.chatId
        ? parsed.chatId
        : (
            await tx
              .insert(chats)
              .values({
                profileId: profile.id,
                visitorId: parsed.visitorId,
                status: "active",
              })
              .returning({ id: chats.id })
          )[0].id;

      await tx.insert(messages).values([
        {
          chatId,
          role: "user",
          content: parsed.message,
          tokenCount: completion.inputTokens,
        },
        {
          chatId,
          role: "assistant",
          content: completion.content,
          tokenCount: completion.outputTokens,
        },
      ]);

      await deductCreditsAndLogUsageWithTx(tx, {
        userId: profile.userId,
        chatId,
        tokensUsed: totalTokens,
        creditsDeducted: creditsToDeduct,
        modelUsed: completion.model,
      });

      return { chatId };
    });

    return {
      ok: true as const,
      status: 200,
      data: {
        chatId: result.chatId,
        answer: completion.content,
        model: completion.model,
        totalTokens,
        creditsDeducted: creditsToDeduct,
      },
    };
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return { ok: false as const, status: 402, error: "Credits exhausted." };
    }

    throw error;
  }
}
