import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

describe("Engagement Router", () => {
  describe("metrics", () => {
    it("should create engagement metrics", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.engagement.metrics.create({
        period: "2026-03",
        followers: 1000,
        followerGrowth: 50,
        totalReach: 5000,
        totalImpressions: 10000,
        engagementRate: "3.5%",
      });

      expect(result).toEqual({ success: true });
    });

    it("should list engagement metrics", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Create a metric first
      await caller.engagement.metrics.create({
        period: "2026-03",
        followers: 1000,
        followerGrowth: 50,
        totalReach: 5000,
        totalImpressions: 10000,
        engagementRate: "3.5%",
      });

      // List metrics
      const metrics = await caller.engagement.metrics.list({});
      expect(Array.isArray(metrics)).toBe(true);
    });
  });

  describe("interactions", () => {
    it("should create a comment interaction", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.engagement.interactions.create({
        type: "comment",
        content: "Great post!",
        authorName: "John Doe",
        sentiment: "positive",
        isResponded: 1,
        responseTime: 30,
        isHighlight: 1,
      });

      expect(result).toEqual({ success: true });
    });

    it("should create a DM interaction", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.engagement.interactions.create({
        type: "dm",
        content: "How much does this cost?",
        authorName: "Jane Smith",
        sentiment: "neutral",
        isResponded: 0,
      });

      expect(result).toEqual({ success: true });
    });

    it("should list interactions", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Create an interaction
      await caller.engagement.interactions.create({
        type: "comment",
        content: "Test comment",
        sentiment: "positive",
      });

      // List interactions
      const interactions = await caller.engagement.interactions.list({});
      expect(Array.isArray(interactions)).toBe(true);
    });

    it("should filter interactions by type", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Create interactions of different types
      await caller.engagement.interactions.create({
        type: "comment",
        content: "Comment",
        sentiment: "positive",
      });

      await caller.engagement.interactions.create({
        type: "dm",
        content: "DM",
        sentiment: "neutral",
      });

      // List only comments
      const comments = await caller.engagement.interactions.list({ type: "comment" });
      expect(Array.isArray(comments)).toBe(true);
    });
  });

  describe("engagement data", () => {
    it("should create engagement data", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.engagement.data.create({
        period: "2026-03",
        dmsReceived: 50,
        dmsResponded: 45,
        commentsReceived: 100,
        commentsResponded: 95,
        avgResponseTime: 30,
        saves: 200,
        shares: 50,
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe("categories", () => {
    it("should create a category", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.engagement.categories.create({
        name: "Dúvidas sobre Preço",
        description: "Perguntas relacionadas a preços",
        color: "#3b82f6",
      });

      expect(result).toEqual({ success: true });
    });

    it("should list categories", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Create a category
      await caller.engagement.categories.create({
        name: "Test Category",
        color: "#ff0000",
      });

      // List categories
      const categories = await caller.engagement.categories.list();
      expect(Array.isArray(categories)).toBe(true);
    });
  });

  describe("FAQs", () => {
    it("should create an FAQ", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.engagement.faqs.create({
        question: "What is the price?",
        frequency: 5,
      });

      expect(result).toEqual({ success: true });
    });

    it("should list FAQs", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Create an FAQ
      await caller.engagement.faqs.create({
        question: "Test question?",
        frequency: 3,
      });

      // List FAQs
      const faqs = await caller.engagement.faqs.list();
      expect(Array.isArray(faqs)).toBe(true);
    });
  });

  describe("analytics", () => {
    it("should get sentiment analysis", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Create interactions with different sentiments
      await caller.engagement.interactions.create({
        type: "comment",
        content: "Great!",
        sentiment: "positive",
      });

      await caller.engagement.interactions.create({
        type: "comment",
        content: "Not bad",
        sentiment: "neutral",
      });

      await caller.engagement.interactions.create({
        type: "comment",
        content: "Terrible!",
        sentiment: "negative",
      });

      const sentiment = await caller.engagement.analytics.sentiment();
      expect(sentiment).toHaveProperty("positive");
      expect(sentiment).toHaveProperty("neutral");
      expect(sentiment).toHaveProperty("negative");
      expect(sentiment.positive).toBeGreaterThanOrEqual(0);
    });

    it("should get interaction stats", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Create interactions
      await caller.engagement.interactions.create({
        type: "dm",
        content: "DM 1",
        sentiment: "neutral",
      });

      await caller.engagement.interactions.create({
        type: "comment",
        content: "Comment 1",
        sentiment: "positive",
      });

      const stats = await caller.engagement.analytics.stats();
      expect(stats).toHaveProperty("dms");
      expect(stats).toHaveProperty("comments");
      expect(stats).toHaveProperty("responded");
      expect(stats).toHaveProperty("notResponded");
      expect(stats.dms).toBeGreaterThanOrEqual(0);
      expect(stats.comments).toBeGreaterThanOrEqual(0);
    });
  });
});
