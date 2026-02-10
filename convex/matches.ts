import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMatches = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Verify user owns the case
    const case_ = await ctx.db.get(args.caseId);
    if (!case_ || case_.createdBy !== userId) {
      return [];
    }

    return await ctx.db
      .query("matches")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .order("desc")
      .collect();
  },
});

export const getPredictions = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Verify user owns the case
    const case_ = await ctx.db.get(args.caseId);
    if (!case_ || case_.createdBy !== userId) {
      return null;
    }

    const predictions = await ctx.db
      .query("predictions")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .order("desc")
      .first();

    return predictions;
  },
});

export const verifyMatch = mutation({
  args: {
    matchId: v.id("matches"),
    verified: v.boolean(),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    const match = await ctx.db.get(args.matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    // Verify user owns the case
    const case_ = await ctx.db.get(match.caseId);
    if (!case_ || case_.createdBy !== userId) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.matchId, {
      verified: args.verified,
      notes: args.notes,
    });
  },
});
