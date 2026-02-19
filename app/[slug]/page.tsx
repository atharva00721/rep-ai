import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PublicRepPage({ params }: Props) {
  const { slug } = await params;
  const [profile] = await db
    .select({
      slug: profiles.slug,
      bio: profiles.bio,
      services: profiles.services,
      pricingInfo: profiles.pricingInfo,
      tone: profiles.tone,
    })
    .from(profiles)
    .where(eq(profiles.slug, slug))
    .limit(1);

  if (!profile) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl p-10">
      <h1 className="text-3xl font-semibold">@{profile.slug}</h1>
      <p className="mt-4 text-zinc-700">{profile.bio}</p>
      <p className="mt-2 text-sm text-zinc-500">Tone: {profile.tone}</p>
      <section className="mt-8">
        <h2 className="text-xl font-medium">Chat endpoint</h2>
        <p className="mt-2 text-zinc-600">POST /api/chat with slug + message to talk with this AI rep.</p>
      </section>
    </main>
  );
}
