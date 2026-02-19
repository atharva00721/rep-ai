import { db } from "@/lib/db/client";
import { leads } from "@/lib/db/schema";

export type LeadCaptureInput = {
  profileId: string;
  chatId?: string;
  name: string;
  email: string;
  budget?: string;
  projectDetails?: string;
};

export async function createLead(input: LeadCaptureInput) {
  const [lead] = await db
    .insert(leads)
    .values({
      profileId: input.profileId,
      chatId: input.chatId,
      name: input.name,
      email: input.email,
      budget: input.budget,
      projectDetails: input.projectDetails,
      status: "new",
    })
    .returning();

  return lead;
}
