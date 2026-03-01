import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Enable live tracking for a case
export const enableLiveTracking = mutation({
  args: {
    caseId: v.id("cases"),
    deviceId: v.optional(v.string()),
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
      liveTrackingEnabled: true,
      trackingDeviceId: args.deviceId || `device_${Date.now()}`,
    });

    // Create initial alert
    await ctx.db.insert("liveAlerts", {
      caseId: args.caseId,
      alertType: "tracking_enabled",
      title: "Live Tracking Activated",
      message: "GPS tracking has been enabled for this case",
      severity: "medium",
      acknowledged: false,
    });

    return { success: true };
  },
});

// Add a new tracking update
export const addTrackingUpdate = mutation({
  args: {
    caseId: v.id("cases"),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    accuracy: v.number(),
    speed: v.optional(v.number()),
    heading: v.optional(v.number()),
    altitude: v.optional(v.number()),
    source: v.string(),
    confidence: v.number(),
    batteryLevel: v.optional(v.number()),
    deviceId: v.optional(v.string()),
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

    // Add tracking update
    await ctx.db.insert("trackingUpdates", args);

    // Update case with latest coordinates
    await ctx.db.patch(args.caseId, {
      lastKnownCoordinates: {
        lat: args.coordinates.lat,
        lng: args.coordinates.lng,
        accuracy: args.accuracy,
        timestamp: Date.now(),
      },
    });

    // Check geofences and create alerts if needed
    await ctx.scheduler.runAfter(0, internal.tracking.checkGeofences, {
      caseId: args.caseId,
      coordinates: args.coordinates,
    });

    return { success: true };
  },
});

// Get tracking updates for a case
export const getTrackingUpdates = query({
  args: {
    caseId: v.id("cases"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const case_ = await ctx.db.get(args.caseId);
    if (!case_ || case_.createdBy !== userId) {
      return [];
    }

    const updates = await ctx.db
      .query("trackingUpdates")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .order("desc")
      .take(args.limit || 50);

    return updates;
  },
});

// Get live alerts for a case
export const getLiveAlerts = query({
  args: {
    caseId: v.id("cases"),
    unacknowledgedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const case_ = await ctx.db.get(args.caseId);
    if (!case_ || case_.createdBy !== userId) {
      return [];
    }

    let query = ctx.db
      .query("liveAlerts")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId));

    if (args.unacknowledgedOnly) {
      query = query.filter((q) => q.eq(q.field("acknowledged"), false));
    }

    return await query.order("desc").collect();
  },
});

// Acknowledge an alert
export const acknowledgeAlert = mutation({
  args: {
    alertId: v.id("liveAlerts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    const alert = await ctx.db.get(args.alertId);
    if (!alert) {
      throw new Error("Alert not found");
    }

    const case_ = await ctx.db.get(alert.caseId);
    if (!case_ || case_.createdBy !== userId) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.alertId, {
      acknowledged: true,
      acknowledgedBy: userId,
      acknowledgedAt: Date.now(),
    });
  },
});

// Create a geofence
export const createGeofence = mutation({
  args: {
    caseId: v.id("cases"),
    name: v.string(),
    type: v.string(),
    coordinates: v.array(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    radius: v.optional(v.number()),
    alertOnEntry: v.boolean(),
    alertOnExit: v.boolean(),
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

    await ctx.db.insert("geofences", {
      ...args,
      active: true,
      createdBy: userId,
    });

    return { success: true };
  },
});

// Get geofences for a case
export const getGeofences = query({
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

    return await ctx.db
      .query("geofences")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

// Internal function to check geofences
export const checkGeofences = internalMutation({
  args: {
    caseId: v.id("cases"),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const geofences = await ctx.db
      .query("geofences")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    for (const geofence of geofences) {
      const isInside = isPointInGeofence(args.coordinates, geofence);
      
      // For simplicity, we'll create alerts for any geofence interaction
      if (isInside && geofence.alertOnEntry) {
        await ctx.db.insert("liveAlerts", {
          caseId: args.caseId,
          alertType: "geofence",
          title: `Entered ${geofence.name}`,
          message: `Person has entered the ${geofence.type} area: ${geofence.name}`,
          severity: geofence.type === "danger_zone" ? "high" : "medium",
          coordinates: args.coordinates,
          acknowledged: false,
        });
      }
    }
  },
});

// Simulate live tracking updates (for demo purposes)
export const simulateTracking = action({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    // This would normally receive real GPS data
    // For demo, we'll simulate movement around a base location
    const baseCoords = { lat: 40.7589, lng: -73.9851 }; // NYC coordinates
    
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const randomOffset = () => (Math.random() - 0.5) * 0.01; // ~1km radius
      const coordinates = {
        lat: baseCoords.lat + randomOffset(),
        lng: baseCoords.lng + randomOffset(),
      };

      await ctx.runMutation(internal.tracking.addSimulatedUpdate, {
        caseId: args.caseId,
        coordinates,
        accuracy: Math.random() * 50 + 10, // 10-60m accuracy
        speed: Math.random() * 5, // 0-5 km/h walking speed
        source: "gps",
        confidence: Math.random() * 20 + 80, // 80-100% confidence
        batteryLevel: Math.max(20, 100 - (i * 15)), // Decreasing battery
      });
    }

    return { success: true };
  },
});

// Internal mutation for simulated updates
export const addSimulatedUpdate = internalMutation({
  args: {
    caseId: v.id("cases"),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    accuracy: v.number(),
    speed: v.optional(v.number()),
    source: v.string(),
    confidence: v.number(),
    batteryLevel: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("trackingUpdates", args);

    await ctx.db.patch(args.caseId, {
      lastKnownCoordinates: {
        lat: args.coordinates.lat,
        lng: args.coordinates.lng,
        accuracy: args.accuracy,
        timestamp: Date.now(),
      },
    });
  },
});

// Helper function to check if point is in geofence
function isPointInGeofence(point: { lat: number; lng: number }, geofence: any): boolean {
  if (geofence.radius) {
    // Circular geofence
    const center = geofence.coordinates[0];
    const distance = getDistance(point, center);
    return distance <= geofence.radius;
  } else {
    // Polygon geofence (simplified - just check if near any point)
    return geofence.coordinates.some((coord: any) => 
      getDistance(point, coord) <= 100 // 100m tolerance
    );
  }
}

// Helper function to calculate distance between two points
function getDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = point1.lat * Math.PI/180;
  const φ2 = point2.lat * Math.PI/180;
  const Δφ = (point2.lat-point1.lat) * Math.PI/180;
  const Δλ = (point2.lng-point1.lng) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}
