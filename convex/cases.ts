import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createCase = mutation({
  args: {
    reporterName: v.string(),
    reporterEmail: v.optional(v.string()),
    reporterPhone: v.optional(v.string()),
    reporterRelation: v.string(),
    personName: v.string(),
    age: v.number(),
    gender: v.string(),
    height: v.string(),
    bodyType: v.string(),
    lastSeenLocation: v.string(),
    lastSeenDate: v.string(),
    lastSeenTime: v.string(),
    clothingDescription: v.string(),
    identifyingFeatures: v.array(v.string()),
    languagesSpoken: v.array(v.string()),
    behavioralPatterns: v.string(),
    photoId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to create a case");
    }

    const caseId = `MP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newCase = await ctx.db.insert("cases", {
      caseId,
      ...args,
      reporterContact: args.reporterEmail || args.reporterPhone || "No contact provided", // Keep for backward compatibility
      analysisComplete: false,
      status: "active",
      priority: "medium",
      createdBy: userId,
    });

    return { caseId: newCase, caseNumber: caseId };
  },
});

export const getCases = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const cases = await ctx.db
      .query("cases")
      .withIndex("by_created_by", (q) => q.eq("createdBy", userId))
      .order("desc")
      .collect();

    return Promise.all(
      cases.map(async (case_) => ({
        ...case_,
        photoUrl: case_.photoId ? await ctx.storage.getUrl(case_.photoId) : null,
      }))
    );
  },
});

export const getCase = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const case_ = await ctx.db.get(args.caseId);
    if (!case_ || case_.createdBy !== userId) {
      return null;
    }

    return {
      ...case_,
      photoUrl: case_.photoId ? await ctx.storage.getUrl(case_.photoId) : null,
    };
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to upload files");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateCaseAnalysis = mutation({
  args: {
    caseId: v.id("cases"),
    faceAnalysis: v.object({
      facialLandmarks: v.array(v.string()),
      visualMarkers: v.array(v.string()),
      confidence: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    const case_ = await ctx.db.get(args.caseId);
    if (!case_ || case_.createdBy !== userId) {
      throw new Error("Case not found or access denied");
    }

    await ctx.db.patch(args.caseId, {
      faceAnalysis: args.faceAnalysis,
      analysisComplete: true,
    });
  },
});
