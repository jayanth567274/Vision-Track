import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  cases: defineTable({
    // Basic Information
    caseId: v.string(),
    reporterName: v.string(),
    reporterContact: v.string(),
    reporterEmail: v.optional(v.string()),
    reporterPhone: v.optional(v.string()),
    reporterRelation: v.string(),
    
    // Missing Person Details
    personName: v.string(),
    age: v.number(),
    gender: v.string(),
    height: v.string(),
    bodyType: v.string(),
    
    // Last Known Information
    lastSeenLocation: v.string(),
    lastSeenDate: v.string(),
    lastSeenTime: v.string(),
    clothingDescription: v.string(),
    
    // Identifying Features
    identifyingFeatures: v.array(v.string()),
    languagesSpoken: v.array(v.string()),
    behavioralPatterns: v.string(),
    
    // Photos
    photoId: v.optional(v.id("_storage")),
    
    // Analysis Results
    analysisComplete: v.boolean(),
    faceAnalysis: v.optional(v.object({
      facialLandmarks: v.array(v.string()),
      visualMarkers: v.array(v.string()),
      confidence: v.number(),
    })),
    
    // Status
    status: v.string(), // "active", "resolved", "closed"
    priority: v.string(), // "high", "medium", "low"
    
    // Metadata
    createdBy: v.id("users"),
  })
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_created_by", ["createdBy"])
    .searchIndex("search_cases", {
      searchField: "personName",
      filterFields: ["status", "priority"],
    }),

  matches: defineTable({
    caseId: v.id("cases"),
    matchType: v.string(), // "cctv", "shelter", "report", "social_media"
    confidence: v.number(),
    location: v.string(),
    description: v.string(),
    timestamp: v.string(),
    verified: v.boolean(),
    notes: v.string(),
  })
    .index("by_case", ["caseId"])
    .index("by_confidence", ["confidence"]),

  predictions: defineTable({
    caseId: v.id("cases"),
    predictedLocations: v.array(v.object({
      area: v.string(),
      probability: v.number(),
      reasoning: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    })),
    movementPattern: v.string(),
    timeElapsed: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_case", ["caseId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
