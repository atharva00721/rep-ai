/**
 * Baseline migrations script
 *
 * Use this when your database already has all tables but __drizzle_migrations
 * has no records (e.g. after db:push or manual setup). This marks all
 * migrations up to 0010 as applied so future migrations run correctly.
 *
 * Run: bun --env-file=.env.local scripts/baseline-migrations.ts
 */
import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not set. Use: bun --env-file=.env.local scripts/baseline-migrations.ts");
    process.exit(1);
  }

  const journalPath = join(process.cwd(), "drizzle/meta/_journal.json");
  const journal = JSON.parse(readFileSync(journalPath, "utf-8"));

  // Get the latest migration's "when" timestamp (used as created_at)
  const entries = journal.entries as Array<{ tag: string; when: number }>;
  const latest = entries.reduce((a, b) => (a.when > b.when ? a : b));

  const sql = postgres(dbUrl);

  const existing = await sql`
    SELECT created_at FROM drizzle.__drizzle_migrations
    ORDER BY created_at DESC LIMIT 1
  `;

  if (existing.length > 0 && Number(existing[0].created_at) >= latest.when) {
    console.log("✓ Migrations already baselined. Nothing to do.");
    await sql.end();
    return;
  }

  await sql`
    INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
    VALUES (${latest.tag}, ${latest.when})
  `;

  console.log(`✓ Baseline complete. Marked migration ${latest.tag} (${latest.when}) as applied.`);
  console.log("  You can now run: bun run db:migrate");
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
