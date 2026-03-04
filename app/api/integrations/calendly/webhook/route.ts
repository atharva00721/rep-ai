import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "@/lib/integrations/calendly";
import { db } from "@/lib/db";
import { agentLeads } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get("calendly-webhook-signature");

    if (!verifySignature(signature, body)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const event = payload.event;
    const data = payload.payload;

    console.log("Calendly Webhook Received:", event);

    if (event === "invitee.created") {
        const email = data.email;
        const meetingTime = data.scheduled_event.start_time;

        // Try to find the lead and update their meeting time
        // We might need a better way to link lead to meeting (e.g. metadata or session ID)
        // For now, we'll matching by email if possible
        if (email) {
            await db.update(agentLeads)
                .set({
                    meetingTime: new Date(meetingTime).toLocaleString(),
                    status: "contacted"
                })
                .where(eq(agentLeads.email, email));
        }
    }

    return NextResponse.json({ success: true });
}
