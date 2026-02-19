import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { usageLogs, users } from "@/lib/db/schema";

type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export class InsufficientCreditsError extends Error {
  constructor() {
    super("Insufficient credits.");
    this.name = "InsufficientCreditsError";
  }
}

export type UsageLogInput = {
  userId: string;
  chatId?: string | null;
  tokensUsed: number;
  creditsDeducted: number;
  modelUsed: string;
};

export async function deductCreditsAndLogUsageWithTx(tx: DbTx, input: UsageLogInput) {
  const updateResult = await tx
    .update(users)
    .set({
      creditsRemaining: sql`${users.creditsRemaining} - ${input.creditsDeducted}`,
      creditsTotalUsed: sql`${users.creditsTotalUsed} + ${input.creditsDeducted}`,
      updatedAt: new Date(),
    })
    .where(and(eq(users.id, input.userId), gte(users.creditsRemaining, input.creditsDeducted)))
    .returning({
      userId: users.id,
      creditsRemaining: users.creditsRemaining,
    });

  if (updateResult.length === 0) {
    throw new InsufficientCreditsError();
  }

  const [log] = await tx
    .insert(usageLogs)
    .values({
      userId: input.userId,
      chatId: input.chatId ?? null,
      tokensUsed: input.tokensUsed,
      creditsDeducted: input.creditsDeducted,
      modelUsed: input.modelUsed,
    })
    .returning();

  return { user: updateResult[0], usageLog: log };
}

export async function deductCreditsAndLogUsage(input: UsageLogInput) {
  return db.transaction(async (tx) => deductCreditsAndLogUsageWithTx(tx, input));
}
