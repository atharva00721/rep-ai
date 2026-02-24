/**
 * Add missing columns to agent_leads table.
 * Run when schema expects session_id, conversation_summary, status, is_read
 * but the database doesn't have them (e.g. after baselining migrations).
 *
 * Run: bun --env-file=.env.local scripts/add-agent-leads-columns.ts
 */
import postgres from "postgres";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not set. Use: bun --env-file=.env.local scripts/add-agent-leads-columns.ts");
    process.exit(1);
  }

  const sql = postgres(dbUrl);

  const alters = [
    `ALTER TABLE "agent_leads" ADD COLUMN IF NOT EXISTS "session_id" uuid`,
    `ALTER TABLE "agent_leads" ADD COLUMN IF NOT EXISTS "conversation_summary" text`,
    `ALTER TABLE "agent_leads" ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'new' NOT NULL`,
    `ALTER TABLE "agent_leads" ADD COLUMN IF NOT EXISTS "is_read" boolean DEFAULT false NOT NULL`,
  ];

  for (const stmt of alters) {
    try {
      await sql.unsafe(stmt);
      console.log(`✓ ${stmt.split(" ")[5]}`);
    } catch (e) {
      console.warn(`  Skipped (may already exist): ${(e as Error).message}`);
    }
  }

  // Add index if it doesn't exist
  try {
    await sql.unsafe(`CREATE INDEX IF NOT EXISTS "agent_leads_session_id_idx" ON "agent_leads" ("session_id")`);
    console.log("✓ agent_leads_session_id_idx");
  } catch (e) {
    console.warn(`  Index may already exist: ${(e as Error).message}`);
  }

  // Add check constraint if missing (PostgreSQL doesn't have IF NOT EXISTS for constraints)
  try {
    await sql.unsafe(`
      DO $$ BEGIN
        ALTER TABLE "agent_leads" ADD CONSTRAINT "agent_leads_status_check"
        CHECK ("agent_leads"."status" IN ('new', 'contacted', 'closed'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    console.log("✓ agent_leads_status_check");
  } catch (e) {
    console.warn(`  Constraint may already exist: ${(e as Error).message}`);
  }

  console.log("\n✓ Done. agent_leads table is now in sync with schema.");
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
