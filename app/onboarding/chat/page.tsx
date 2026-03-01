import { redirect } from "next/navigation";
import { getSession } from "@/auth";
import { OnboardingChatWrapper } from "@/app/onboarding/onboarding-chat-wrapper";

export default async function OnboardingChatPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/onboarding/chat");
  }

  return <OnboardingChatWrapper />;
}
