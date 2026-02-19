import { notFound } from "next/navigation";

interface PublicAIPageProps {
  params: Promise<{ slug: string }>;
}

function isValidSlug(slug: string): boolean {
  // Allow alphanumeric characters and hyphens only
  // Must start and end with alphanumeric character
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;
  return slugPattern.test(slug) && slug.length > 0 && slug.length <= 100;
}

export default async function PublicAIPage({ params }: PublicAIPageProps) {
  const { slug } = await params;

  // Validate slug format
  if (!isValidSlug(slug)) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl p-10">
      <h1 className="text-3xl font-bold">Public AI Page</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-300">
        You are viewing <span className="font-mono">/{slug}</span>.
      </p>
    </main>
  );
}
