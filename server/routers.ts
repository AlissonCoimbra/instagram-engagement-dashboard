import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getEngagementMetrics,
  createEngagementMetric,
  updateEngagementMetric,
  getInteractions,
  createInteraction,
  updateInteraction,
  deleteInteraction,
  getEngagementData,
  createEngagementData,
  updateEngagementData,
  getCategories,
  createCategory,
  deleteCategory,
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getSentimentAnalysis,
  getInteractionStats,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  engagement: router({
    metrics: router({
      list: protectedProcedure
        .input(z.object({ period: z.string().optional() }).optional())
        .query(async ({ ctx, input }) => {
          return await getEngagementMetrics(ctx.user.id, input?.period);
        }),
      create: protectedProcedure
        .input(
          z.object({
            period: z.string(),
            followers: z.number().optional(),
            followerGrowth: z.number().optional(),
            totalReach: z.number().optional(),
            totalImpressions: z.number().optional(),
            engagementRate: z.string().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          await createEngagementMetric({ userId: ctx.user.id, ...input });
          return { success: true };
        }),
      update: protectedProcedure
        .input(
          z.object({
            id: z.number(),
            followers: z.number().optional(),
            followerGrowth: z.number().optional(),
            totalReach: z.number().optional(),
            totalImpressions: z.number().optional(),
            engagementRate: z.string().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const { id, ...data } = input;
          await updateEngagementMetric(id, data);
          return { success: true };
        }),
    }),

    interactions: router({
      list: protectedProcedure
        .input(z.object({ type: z.enum(["dm", "comment"]).optional() }).optional())
        .query(async ({ ctx, input }) => {
          return await getInteractions(ctx.user.id, input?.type);
        }),
      create: protectedProcedure
        .input(
          z.object({
            type: z.enum(["dm", "comment"]),
            content: z.string().optional(),
            authorName: z.string().optional(),
            sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
            isResponded: z.number().optional(),
            responseTime: z.number().optional(),
            tags: z.string().optional(),
            category: z.string().optional(),
            isHighlight: z.number().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          await createInteraction({ userId: ctx.user.id, ...input });
          return { success: true };
        }),
      update: protectedProcedure
        .input(
          z.object({
            id: z.number(),
            sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
            isResponded: z.number().optional(),
            responseTime: z.number().optional(),
            tags: z.string().optional(),
            category: z.string().optional(),
            isHighlight: z.number().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const { id, ...data } = input;
          await updateInteraction(id, data);
          return { success: true };
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          await deleteInteraction(input.id);
          return { success: true };
        }),
    }),

    data: router({
      list: protectedProcedure
        .input(z.object({ period: z.string().optional() }).optional())
        .query(async ({ ctx, input }) => {
          return await getEngagementData(ctx.user.id, input?.period);
        }),
      create: protectedProcedure
        .input(
          z.object({
            period: z.string(),
            dmsReceived: z.number().optional(),
            dmsResponded: z.number().optional(),
            commentsReceived: z.number().optional(),
            commentsResponded: z.number().optional(),
            avgResponseTime: z.number().optional(),
            saves: z.number().optional(),
            shares: z.number().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          await createEngagementData({ userId: ctx.user.id, ...input });
          return { success: true };
        }),
      update: protectedProcedure
        .input(
          z.object({
            id: z.number(),
            dmsReceived: z.number().optional(),
            dmsResponded: z.number().optional(),
            commentsReceived: z.number().optional(),
            commentsResponded: z.number().optional(),
            avgResponseTime: z.number().optional(),
            saves: z.number().optional(),
            shares: z.number().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const { id, ...data } = input;
          await updateEngagementData(id, data);
          return { success: true };
        }),
    }),

    categories: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return await getCategories(ctx.user.id);
      }),
      create: protectedProcedure
        .input(
          z.object({
            name: z.string(),
            description: z.string().optional(),
            color: z.string().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          await createCategory({ userId: ctx.user.id, ...input });
          return { success: true };
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          await deleteCategory(input.id);
          return { success: true };
        }),
    }),

    faqs: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return await getFAQs(ctx.user.id);
      }),
      create: protectedProcedure
        .input(
          z.object({
            question: z.string(),
            frequency: z.number().optional(),
            categoryId: z.number().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          await createFAQ({ userId: ctx.user.id, ...input });
          return { success: true };
        }),
      update: protectedProcedure
        .input(
          z.object({
            id: z.number(),
            frequency: z.number().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const { id, ...data } = input;
          await updateFAQ(id, data);
          return { success: true };
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          await deleteFAQ(input.id);
          return { success: true };
        }),
    }),

    analytics: router({
      sentiment: protectedProcedure.query(async ({ ctx }) => {
        return await getSentimentAnalysis(ctx.user.id);
      }),
      stats: protectedProcedure.query(async ({ ctx }) => {
        return await getInteractionStats(ctx.user.id);
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
