import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, engagementMetrics, InsertEngagementMetric, interactions, InsertInteraction, engagementData, InsertEngagementData, categories, InsertCategory, faqs, InsertFAQ } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Engagement Metrics queries
export async function getEngagementMetrics(userId: number, period?: string) {
  const db = await getDb();
  if (!db) return [];

  if (period) {
    return await db.select().from(engagementMetrics).where(eq(engagementMetrics.userId, userId) && eq(engagementMetrics.period, period)).orderBy(desc(engagementMetrics.createdAt));
  }
  return await db.select().from(engagementMetrics).where(eq(engagementMetrics.userId, userId)).orderBy(desc(engagementMetrics.createdAt));
}

export async function createEngagementMetric(data: InsertEngagementMetric) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(engagementMetrics).values(data);
}

export async function updateEngagementMetric(id: number, data: Partial<InsertEngagementMetric>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(engagementMetrics).set(data).where(eq(engagementMetrics.id, id));
}

// Interactions queries
export async function getInteractions(userId: number, type?: "dm" | "comment") {
  const db = await getDb();
  if (!db) return [];

  if (type) {
    return await db.select().from(interactions).where(eq(interactions.userId, userId) && eq(interactions.type, type)).orderBy(desc(interactions.createdAt));
  }
  return await db.select().from(interactions).where(eq(interactions.userId, userId)).orderBy(desc(interactions.createdAt));
}

export async function createInteraction(data: InsertInteraction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(interactions).values(data);
}

export async function updateInteraction(id: number, data: Partial<InsertInteraction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(interactions).set(data).where(eq(interactions.id, id));
}

export async function deleteInteraction(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(interactions).where(eq(interactions.id, id));
}

// Engagement Data queries
export async function getEngagementData(userId: number, period?: string) {
  const db = await getDb();
  if (!db) return [];

  if (period) {
    return await db.select().from(engagementData).where(eq(engagementData.userId, userId) && eq(engagementData.period, period)).orderBy(desc(engagementData.createdAt));
  }
  return await db.select().from(engagementData).where(eq(engagementData.userId, userId)).orderBy(desc(engagementData.createdAt));
}

export async function createEngagementData(data: InsertEngagementData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(engagementData).values(data);
}

export async function updateEngagementData(id: number, data: Partial<InsertEngagementData>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(engagementData).set(data).where(eq(engagementData.id, id));
}

// Categories queries
export async function getCategories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(categories).where(eq(categories.userId, userId));
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(categories).values(data);
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(categories).where(eq(categories.id, id));
}

// FAQ queries
export async function getFAQs(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(faqs).where(eq(faqs.userId, userId)).orderBy(desc(faqs.frequency));
}

export async function createFAQ(data: InsertFAQ) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(faqs).values(data);
}

export async function updateFAQ(id: number, data: Partial<InsertFAQ>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(faqs).set(data).where(eq(faqs.id, id));
}

export async function deleteFAQ(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(faqs).where(eq(faqs.id, id));
}

// Analytics queries
export async function getSentimentAnalysis(userId: number) {
  const db = await getDb();
  if (!db) return { positive: 0, neutral: 0, negative: 0 };

  const analysis = { positive: 0, neutral: 0, negative: 0 };
  const allInteractions = await db.select().from(interactions).where(eq(interactions.userId, userId));
  
  allInteractions.forEach((interaction) => {
    if (interaction.sentiment === "positive") analysis.positive++;
    else if (interaction.sentiment === "neutral") analysis.neutral++;
    else if (interaction.sentiment === "negative") analysis.negative++;
  });

  return analysis;
}

export async function getInteractionStats(userId: number) {
  const db = await getDb();
  if (!db) return { dms: 0, comments: 0, responded: 0, notResponded: 0 };

  const allInteractions = await db.select().from(interactions).where(eq(interactions.userId, userId));
  
  return {
    dms: allInteractions.filter(i => i.type === "dm").length,
    comments: allInteractions.filter(i => i.type === "comment").length,
    responded: allInteractions.filter(i => i.isResponded === 1).length,
    notResponded: allInteractions.filter(i => i.isResponded === 0).length,
  };
}
