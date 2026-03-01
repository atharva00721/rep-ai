import { redirect } from "next/navigation";
import { getSession } from "@/auth";
import { OnboardingExpressFlow } from "@/app/onboarding/onboarding-express-flow";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/onboarding");
  }

  return <OnboardingExpressFlow />;
}
