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
    
    // Live Tracking
    liveTrackingEnabled: v.optional(v.boolean()),
    trackingDeviceId: v.optional(v.string()),
    lastKnownCoordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
      accuracy: v.number(),
      timestamp: v.number(),
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
    .index("by_tracking_enabled", ["liveTrackingEnabled"])
    .searchIndex("search_cases", {
      searchField: "personName",
      filterFields: ["status", "priority"],
    }),

  matches: defineTable({
    caseId: v.id("cases"),
    sourceFootageId: v.optional(v.id("cctvFootage")),
    matchType: v.string(), // "cctv", "shelter", "report", "social_media", "gps_ping"
    confidence: v.number(),
    location: v.string(),
    description: v.string(),
    timestamp: v.string(),
    verified: v.boolean(),
    notes: v.string(),
    coordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
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

  // Live Tracking Data
  trackingUpdates: defineTable({
    caseId: v.id("cases"),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    accuracy: v.number(),
    speed: v.optional(v.number()),
    heading: v.optional(v.number()),
    altitude: v.optional(v.number()),
    source: v.string(), // "gps", "cell_tower", "wifi", "manual", "witness"
    confidence: v.number(),
    batteryLevel: v.optional(v.number()),
    deviceId: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_case", ["caseId"]),

  // Live Alerts
  liveAlerts: defineTable({
    caseId: v.id("cases"),
    alertType: v.string(), // "movement", "geofence", "battery_low", "device_offline", "emergency"
    title: v.string(),
    message: v.string(),
    severity: v.string(), // "low", "medium", "high", "critical"
    coordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    acknowledged: v.boolean(),
    acknowledgedBy: v.optional(v.id("users")),
    acknowledgedAt: v.optional(v.number()),
  })
    .index("by_case", ["caseId"])
    .index("by_severity", ["severity"])
    .index("by_acknowledged", ["acknowledged"]),

  // Geofences
  geofences: defineTable({
    caseId: v.id("cases"),
    name: v.string(),
    type: v.string(), // "safe_zone", "danger_zone", "search_area"
    coordinates: v.array(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    radius: v.optional(v.number()), // For circular geofences
    active: v.boolean(),
    alertOnEntry: v.boolean(),
    alertOnExit: v.boolean(),
    createdBy: v.id("users"),
  })
    .index("by_case", ["caseId"])
    .index("by_active", ["active"]),

  // NEW: CCTV Footage
  cctvFootage: defineTable({
    caseId: v.id("cases"),
    location: v.string(),
    cameraId: v.string(),
    timestamp: v.number(),
    duration: v.number(), // in seconds
    footageType: v.optional(v.string()), // "cctv" | "photo"
    mediaType: v.optional(v.string()),
    videoId: v.optional(v.id("_storage")), // Video file
    thumbnailId: v.optional(v.id("_storage")), // Thumbnail image
    coordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    confidence: v.number(), // AI confidence in person identification
    status: v.string(), // "pending", "reviewed", "confirmed", "rejected"
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    aiAnalysis: v.optional(v.object({
      personDetected: v.boolean(),
      clothingMatch: v.number(),
      facialMatch: v.number(),
      movementPattern: v.string(),
    })),
  })
    .index("by_case", ["caseId"])
    .index("by_status", ["status"])
    .index("by_confidence", ["confidence"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
