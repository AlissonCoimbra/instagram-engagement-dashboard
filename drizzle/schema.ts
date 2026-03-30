import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Engagement Metrics - Armazena as métricas principais de engajamento do período
 */
export const engagementMetrics = mysqlTable("engagement_metrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  period: varchar("period", { length: 50 }).notNull(), // ex: "2026-03"
  followers: int("followers").default(0),
  followerGrowth: int("followerGrowth").default(0),
  totalReach: int("totalReach").default(0),
  totalImpressions: int("totalImpressions").default(0),
  engagementRate: varchar("engagementRate", { length: 10 }), // ex: "3.5%"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EngagementMetric = typeof engagementMetrics.$inferSelect;
export type InsertEngagementMetric = typeof engagementMetrics.$inferInsert;

/**
 * Interactions - Armazena DMs e comentários individuais
 */
export const interactions = mysqlTable("interactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  type: mysqlEnum("type", ["dm", "comment"]).notNull(),
  content: text("content"),
  authorName: varchar("authorName", { length: 255 }),
  sentiment: mysqlEnum("sentiment", ["positive", "neutral", "negative"]).default("neutral"),
  isResponded: int("isResponded").default(0),
  responseTime: int("responseTime"), // em minutos
  tags: varchar("tags", { length: 500 }), // JSON array of tags
  category: varchar("category", { length: 100 }),
  isHighlight: int("isHighlight").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Interaction = typeof interactions.$inferSelect;
export type InsertInteraction = typeof interactions.$inferInsert;

/**
 * Engagement Data - Armazena dados quantitativos de DMs e comentários
 */
export const engagementData = mysqlTable("engagement_data", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  period: varchar("period", { length: 50 }).notNull(),
  dmsReceived: int("dmsReceived").default(0),
  dmsResponded: int("dmsResponded").default(0),
  commentsReceived: int("commentsReceived").default(0),
  commentsResponded: int("commentsResponded").default(0),
  avgResponseTime: int("avgResponseTime").default(0), // em minutos
  saves: int("saves").default(0),
  shares: int("shares").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EngagementDataRecord = typeof engagementData.$inferSelect;
export type InsertEngagementData = typeof engagementData.$inferInsert;

/**
 * Categories - Armazena categorias de dúvidas e temas
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }), // hex color
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * FAQ - Armazena dúvidas frequentes
 */
export const faqs = mysqlTable("faqs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  question: text("question").notNull(),
  frequency: int("frequency").default(1),
  categoryId: int("categoryId").references(() => categories.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FAQ = typeof faqs.$inferSelect;
export type InsertFAQ = typeof faqs.$inferInsert;