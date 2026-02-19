import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const planEnum = pgEnum("plan", ["free", "pro", "agency"]);
export const chatStatusEnum = pgEnum("chat_status", ["active", "archived"]);
export const messageRoleEnum = pgEnum("message_role", ["user", "assistant", "system"]);
export const leadStatusEnum = pgEnum("lead_status", ["new", "contacted", "closed"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    plan: planEnum("plan").default("free").notNull(),
    creditsRemaining: integer("credits_remaining").default(0).notNull(),
    creditsTotalUsed: integer("credits_total_used").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_email_uidx").on(table.email)],
);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 80 }).notNull(),
    bio: text("bio").notNull(),
    services: jsonb("services").$type<Array<{ name: string; description?: string }>>().notNull().default([]),
    pricingInfo: text("pricing_info"),
    tone: varchar("tone", { length: 120 }).notNull().default("professional"),
    aiInstructions: text("ai_instructions"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("profiles_slug_uidx").on(table.slug),
    index("profiles_user_id_idx").on(table.userId),
  ],
);

export const chats = pgTable(
  "chats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    visitorId: uuid("visitor_id"),
    status: chatStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("chats_profile_id_idx").on(table.profileId), index("chats_visitor_id_idx").on(table.visitorId)],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    chatId: uuid("chat_id")
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),
    role: messageRoleEnum("role").notNull(),
    content: text("content").notNull(),
    tokenCount: integer("token_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("messages_chat_id_idx").on(table.chatId)],
);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    chatId: uuid("chat_id").references(() => chats.id, { onDelete: "set null" }),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    budget: varchar("budget", { length: 120 }),
    projectDetails: text("project_details"),
    status: leadStatusEnum("status").default("new").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("leads_profile_id_idx").on(table.profileId), index("leads_chat_id_idx").on(table.chatId)],
);

export const usageLogs = pgTable(
  "usage_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    chatId: uuid("chat_id").references(() => chats.id, { onDelete: "set null" }),
    tokensUsed: integer("tokens_used").notNull(),
    creditsDeducted: integer("credits_deducted").notNull(),
    modelUsed: varchar("model_used", { length: 120 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("usage_logs_user_id_idx").on(table.userId), index("usage_logs_chat_id_idx").on(table.chatId)],
);

export const usersRelations = relations(users, ({ many }) => ({
  profiles: many(profiles),
  usageLogs: many(usageLogs),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  chats: many(chats),
  leads: many(leads),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [chats.profileId],
    references: [profiles.id],
  }),
  messages: many(messages),
  leads: many(leads),
  usageLogs: many(usageLogs),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  profile: one(profiles, {
    fields: [leads.profileId],
    references: [profiles.id],
  }),
  chat: one(chats, {
    fields: [leads.chatId],
    references: [chats.id],
  }),
}));

export const usageLogsRelations = relations(usageLogs, ({ one }) => ({
  user: one(users, {
    fields: [usageLogs.userId],
    references: [users.id],
  }),
  chat: one(chats, {
    fields: [usageLogs.chatId],
    references: [chats.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Chat = typeof chats.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type UsageLog = typeof usageLogs.$inferSelect;
