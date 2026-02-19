CREATE TYPE "public"."chat_status" AS ENUM('active', 'archived');
CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'closed');
CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant', 'system');
CREATE TYPE "public"."plan" AS ENUM('free', 'pro', 'agency');

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" varchar(320) NOT NULL,
  "name" varchar(160) NOT NULL,
  "plan" "plan" DEFAULT 'free' NOT NULL,
  "credits_remaining" integer DEFAULT 0 NOT NULL,
  "credits_total_used" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "users_email_uidx" ON "users" USING btree ("email");

CREATE TABLE "profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "slug" varchar(80) NOT NULL,
  "bio" text NOT NULL,
  "services" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "pricing_info" text,
  "tone" varchar(120) DEFAULT 'professional' NOT NULL,
  "ai_instructions" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade
);
CREATE UNIQUE INDEX "profiles_slug_uidx" ON "profiles" USING btree ("slug");
CREATE INDEX "profiles_user_id_idx" ON "profiles" USING btree ("user_id");

CREATE TABLE "chats" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "profile_id" uuid NOT NULL,
  "visitor_id" uuid,
  "status" "chat_status" DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "chats_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade
);
CREATE INDEX "chats_profile_id_idx" ON "chats" USING btree ("profile_id");
CREATE INDEX "chats_visitor_id_idx" ON "chats" USING btree ("visitor_id");

CREATE TABLE "messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "chat_id" uuid NOT NULL,
  "role" "message_role" NOT NULL,
  "content" text NOT NULL,
  "token_count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade
);
CREATE INDEX "messages_chat_id_idx" ON "messages" USING btree ("chat_id");

CREATE TABLE "leads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "profile_id" uuid NOT NULL,
  "chat_id" uuid,
  "name" varchar(160) NOT NULL,
  "email" varchar(320) NOT NULL,
  "budget" varchar(120),
  "project_details" text,
  "status" "lead_status" DEFAULT 'new' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "leads_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade,
  CONSTRAINT "leads_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE set null
);
CREATE INDEX "leads_profile_id_idx" ON "leads" USING btree ("profile_id");
CREATE INDEX "leads_chat_id_idx" ON "leads" USING btree ("chat_id");

CREATE TABLE "usage_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "chat_id" uuid,
  "tokens_used" integer NOT NULL,
  "credits_deducted" integer NOT NULL,
  "model_used" varchar(120) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "usage_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade,
  CONSTRAINT "usage_logs_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE set null
);
CREATE INDEX "usage_logs_user_id_idx" ON "usage_logs" USING btree ("user_id");
CREATE INDEX "usage_logs_chat_id_idx" ON "usage_logs" USING btree ("chat_id");
