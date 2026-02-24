CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"session_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"is_from_visitor" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chat_messages_role_check" CHECK ("chat_messages"."role" IN ('user', 'assistant'))
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"visitor_id" text,
	"country" varchar(2),
	"device_info" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "knowledge_chunks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"source_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"chunk_text" text NOT NULL,
	"embedding" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_sources" (
	"id" uuid PRIMARY KEY NOT NULL,
	"agent_id" uuid NOT NULL,
	"title" varchar(160) NOT NULL,
	"type" varchar(20) DEFAULT 'text' NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "knowledge_sources_type_check" CHECK ("knowledge_sources"."type" IN ('text'))
);
--> statement-breakpoint
CREATE TABLE "portfolio_analytics" (
	"id" uuid PRIMARY KEY NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"referrer" text,
	"user_agent" text,
	"country" varchar(2),
	"session_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "portfolio_analytics_type_check" CHECK ("portfolio_analytics"."type" IN ('page_view', 'chat_session_start', 'chat_message'))
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "credits" SET DEFAULT 500;--> statement-breakpoint
ALTER TABLE "agent_leads" ADD COLUMN "session_id" uuid;--> statement-breakpoint
ALTER TABLE "agent_leads" ADD COLUMN "conversation_summary" text;--> statement-breakpoint
ALTER TABLE "agent_leads" ADD COLUMN "status" varchar(20) DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_leads" ADD COLUMN "is_read" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_source_id_knowledge_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."knowledge_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_analytics" ADD CONSTRAINT "portfolio_analytics_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_messages_session_id_idx" ON "chat_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "chat_sessions_portfolio_id_idx" ON "chat_sessions" USING btree ("portfolio_id");--> statement-breakpoint
CREATE INDEX "chat_sessions_session_id_idx" ON "chat_sessions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "chat_sessions_started_at_idx" ON "chat_sessions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "knowledge_chunks_agent_id_idx" ON "knowledge_chunks" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "knowledge_chunks_source_id_idx" ON "knowledge_chunks" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "knowledge_sources_agent_id_idx" ON "knowledge_sources" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "portfolio_analytics_portfolio_id_idx" ON "portfolio_analytics" USING btree ("portfolio_id");--> statement-breakpoint
CREATE INDEX "portfolio_analytics_created_at_idx" ON "portfolio_analytics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "agent_leads_session_id_idx" ON "agent_leads" USING btree ("session_id");--> statement-breakpoint
ALTER TABLE "agent_leads" ADD CONSTRAINT "agent_leads_status_check" CHECK ("agent_leads"."status" IN ('new', 'contacted', 'closed'));