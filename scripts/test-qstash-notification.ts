import { db } from "@/lib/db";
import { users, portfolios, agents, agentLeads } from "@/lib/schema";
import { scheduleLeadNotification } from "@/lib/ai/qstash-notifier";
import { eq } from "drizzle-orm";

async function testQStashFlow() {
    console.log("🚀 Starting QStash Lead Notification Test...");

    // 1. Get a user who actually has an agent
    const [agent] = await db.select().from(agents).limit(1);
    if (!agent) {
        console.error("❌ No agent found in database. Please create an agent first.");
        return;
    }
    const [user] = await db.select().from(users).where(eq(users.id, agent.userId)).limit(1);

    if (!user) {
        console.error("❌ Agent exists but owner user not found.");
        return;
    }

    const TEST_EMAIL = "atharvaraj@gmail.com";
    console.log(`✅ Setting agent notification email to: ${TEST_EMAIL}`);
    await db.update(agents).set({ notificationEmail: TEST_EMAIL }).where(eq(agents.id, agent.id));

    console.log(`✅ Using user: ${user.email}`);
    console.log(`✅ Using agent: ${agent.id}`);

    // 2. Create a Mock Lead in the database
    const sessionId = crypto.randomUUID();
    const leadId = crypto.randomUUID();

    console.log(`📝 Creating mock lead with sessionId: ${sessionId}`);

    await db.insert(agentLeads).values({
        id: leadId,
        agentId: agent.id,
        sessionId: sessionId,
        name: "Test User " + Math.floor(Math.random() * 1000),
        email: "test-lead@example.com",
        projectDetails: "I need a high-end portfolio built with Next.js",
        budget: "$5,000",
        phone: "+123456789",
        website: "https://example-lead-site.com",
        confidence: 0.95,
        notificationSent: false,
        updatedAt: new Date(),
    });

    // 3. Trigger the QStash Scheduler
    console.log("📡 Triggering QStash Scheduler...");

    // NOTE: For the script to work locally, ensure NEXT_PUBLIC_APP_URL is set in .env.local
    // If it's localhost, QStash will accept it but won't be able to hit your local machine 
    // unless you have ngrok running.
    await scheduleLeadNotification(sessionId);

    console.log("\n--- TEST SUMMARY ---");
    console.log("1. Mock lead created in DB.");
    console.log("2. QStash message dispatched.");
    console.log(`3. Check your Upstash Dashboard (QStash tab) for a new pending message.`);
    console.log(`4. In 5 minutes, QStash will try to hit: ${process.env.NEXT_PUBLIC_APP_URL || 'localhost'}/api/webhooks/qstash/lead-notification`);
    console.log("--------------------");

    process.exit(0);
}

testQStashFlow().catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
});
