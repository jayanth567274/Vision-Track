import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Upload CCTV footage
export const uploadCCTVFootage = mutation({
  args: {
    caseId: v.id("cases"),
    location: v.string(),
    cameraId: v.string(),
    timestamp: v.number(),
    duration: v.number(),
    videoId: v.optional(v.id("_storage")),
    thumbnailId: v.optional(v.id("_storage")),
    coordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    notes: v.optional(v.string()),
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

    const footageId = await ctx.db.insert("cctvFootage", {
      ...args,
      confidence: 0, // Will be updated by AI analysis
      status: "pending",
    });

    // Trigger AI analysis of the footage
    if (args.videoId) {
      await ctx.scheduler.runAfter(0, internal.cctv.analyzeCCTVFootage, {
        footageId,
        caseId: args.caseId,
      });
    }

    return { footageId };
  },
});

// Get CCTV footage for a case
export const getCCTVFootage = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const case_ = await ctx.db.get(args.caseId);
    if (!case_ || case_.createdBy !== userId) {
      return [];
    }

    const footage = await ctx.db
      .query("cctvFootage")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .order("desc")
      .collect();

    return Promise.all(
      footage.map(async (item) => ({
        ...item,
        videoUrl: item.videoId ? await ctx.storage.getUrl(item.videoId) : null,
        thumbnailUrl: item.thumbnailId ? await ctx.storage.getUrl(item.thumbnailId) : null,
      }))
    );
  },
});

// Review CCTV footage
export const reviewCCTVFootage = mutation({
  args: {
    footageId: v.id("cctvFootage"),
    status: v.string(), // "confirmed", "rejected"
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    const footage = await ctx.db.get(args.footageId);
    if (!footage) {
      throw new Error("Footage not found");
    }

    const case_ = await ctx.db.get(footage.caseId);
    if (!case_ || case_.createdBy !== userId) {
      throw new Error("Access denied");
    }

    const existingMatches = await ctx.db
      .query("matches")
      .withIndex("by_case", (q) => q.eq("caseId", footage.caseId))
      .collect();

    for (const match of existingMatches) {
      if (match.matchType === "cctv" && match.sourceFootageId === args.footageId) {
        await ctx.db.delete(match._id);
      }
    }

    await ctx.db.patch(args.footageId, {
      status: args.status,
      reviewedBy: userId,
      reviewedAt: Date.now(),
      notes: args.notes,
    });

    // If confirmed, create a match entry
    if (args.status === "confirmed") {
      await ctx.db.insert("matches", {
        caseId: footage.caseId,
        sourceFootageId: args.footageId,
        matchType: "cctv",
        confidence: footage.confidence,
        location: footage.location,
        description: `CCTV footage from ${footage.location} at ${new Date(footage.timestamp).toLocaleString()}`,
        timestamp: new Date(footage.timestamp).toISOString(),
        verified: true,
        notes: args.notes || "Confirmed CCTV sighting",
        coordinates: footage.coordinates,
      });
    }

    return { success: true };
  },
});

// Generate upload URL for CCTV files
export const generateCCTVUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to upload files");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

// Internal function to analyze CCTV footage with AI
export const analyzeCCTVFootage = internalMutation({
  args: {
    footageId: v.id("cctvFootage"),
    caseId: v.id("cases"),
  },
  handler: async (ctx, args) => {
    // Simulate AI analysis of CCTV footage
    await new Promise(resolve => setTimeout(resolve, 3000));

    const aiAnalysis = {
      personDetected: Math.random() > 0.2, // 80% chance of person detection
      clothingMatch: Math.random() * 100, // 0-100% clothing match
      facialMatch: Math.random() * 100, // 0-100% facial match
      movementPattern: Math.random() > 0.5 ? "Walking normally" : "Moving quickly",
    };

    const confidence = aiAnalysis.personDetected 
      ? (aiAnalysis.clothingMatch + aiAnalysis.facialMatch) / 2
      : 0;

    await ctx.db.patch(args.footageId, {
      confidence,
      aiAnalysis,
      status: confidence > 70 ? "reviewed" : "pending",
    });

    // Create alert for high-confidence matches
    if (confidence > 80) {
      await ctx.db.insert("liveAlerts", {
        caseId: args.caseId,
        alertType: "cctv_match",
        title: "High-Confidence CCTV Match",
        message: `AI detected a ${confidence.toFixed(1)}% match in CCTV footage`,
        severity: "high",
        acknowledged: false,
      });
    }
  },
});

// Internal function to create simulated footage
export const createSimulatedFootage = internalMutation({
  args: {
    caseId: v.id("cases"),
    location: v.string(),
    cameraId: v.string(),
    timestamp: v.number(),
    duration: v.number(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const confidence = Math.random() * 100;
    
    await ctx.db.insert("cctvFootage", {
      ...args,
      confidence,
      status: confidence > 70 ? "reviewed" : "pending",
      aiAnalysis: {
        personDetected: confidence > 30,
        clothingMatch: Math.random() * 100,
        facialMatch: Math.random() * 100,
        movementPattern: Math.random() > 0.5 ? "Walking normally" : "Moving quickly",
      },
    });
  },
});
