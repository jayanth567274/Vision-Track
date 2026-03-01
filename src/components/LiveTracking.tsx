import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface LiveTrackingProps {
  caseId: string;
  case_: any;
}

export function LiveTracking({ caseId, case_ }: LiveTrackingProps) {
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(case_?.liveTrackingEnabled || false);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const trackingUpdates = useQuery(api.tracking.getTrackingUpdates, { 
    caseId: caseId as Id<"cases">,
    limit: 20 
  });
  const liveAlerts = useQuery(api.tracking.getLiveAlerts, { 
    caseId: caseId as Id<"cases">,
    unacknowledgedOnly: true 
  });
  const geofences = useQuery(api.tracking.getGeofences, { 
    caseId: caseId as Id<"cases"> 
  });

  const enableTracking = useMutation(api.tracking.enableLiveTracking);
  const acknowledgeAlert = useMutation(api.tracking.acknowledgeAlert);
  const simulateTracking = useAction(api.tracking.simulateTracking);

  const handleEnableTracking = async () => {
    try {
      await enableTracking({
        caseId: caseId as Id<"cases">,
        deviceId: `device_${Date.now()}`,
      });
      setIsTrackingEnabled(true);
      toast.success("📍 Live tracking enabled!");
    } catch (error) {
      toast.error("Failed to enable tracking");
    }
  };

  const handleSimulateTracking = async () => {
    if (!isTrackingEnabled) {
      toast.error("Please enable tracking first");
      return;
    }

    setIsSimulating(true);
    try {
      await simulateTracking({ caseId: caseId as Id<"cases"> });
      toast.success("🎯 Tracking simulation completed!");
    } catch (error) {
      toast.error("Simulation failed");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert({ alertId: alertId as Id<"liveAlerts"> });
      toast.success("Alert acknowledged");
    } catch (error) {
      toast.error("Failed to acknowledge alert");
    }
  };

  return (
    <div className="space-y-6">
      {/* Tracking Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">📍 Live Tracking Status</h3>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isTrackingEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className={`text-sm font-medium ${isTrackingEnabled ? 'text-green-700' : 'text-gray-500'}`}>
              {isTrackingEnabled ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
        </div>

        {!isTrackingEnabled ? (
          <div className="text-center py-6">
            <div className="text-gray-400 text-4xl mb-3">📱</div>
            <p className="text-gray-600 mb-4">Live tracking is not enabled for this case</p>
            <button
              onClick={handleEnableTracking}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Enable Live Tracking
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Device ID:</span>
                <p className="font-mono text-gray-900">{case_?.trackingDeviceId}</p>
              </div>
              <div>
                <span className="text-gray-600">Last Update:</span>
                <p className="text-gray-900">
                  {case_?.lastKnownCoordinates 
                    ? new Date(case_.lastKnownCoordinates.timestamp).toLocaleString()
                    : 'No updates yet'
                  }
                </p>
              </div>
            </div>

            {case_?.lastKnownCoordinates && (
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Last Known Location:</strong> {case_.lastKnownCoordinates.lat.toFixed(6)}, {case_.lastKnownCoordinates.lng.toFixed(6)}
                  <br />
                  <strong>Accuracy:</strong> ±{case_.lastKnownCoordinates.accuracy}m
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSimulateTracking}
                disabled={isSimulating}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isSimulating ? "Simulating..." : "🎯 Simulate Tracking"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live Alerts */}
      {liveAlerts && liveAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🚨 Live Alerts</h3>
          <div className="space-y-3">
            {liveAlerts.map((alert) => (
              <div key={alert._id} className={`border-l-4 pl-4 py-2 ${
                alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert._creationTime).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAcknowledgeAlert(alert._id)}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tracking History */}
      {trackingUpdates && trackingUpdates.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Tracking History</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {trackingUpdates.map((update) => (
              <div key={update._id} className="border border-gray-200 rounded p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      update.confidence >= 90 ? 'bg-green-500' :
                      update.confidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></span>
                    <span className="text-sm font-medium text-gray-900">
                      {update.source.toUpperCase()} Update
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(update._creationTime).toLocaleString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Coordinates:</span>
                    <p className="font-mono">{update.coordinates.lat.toFixed(6)}, {update.coordinates.lng.toFixed(6)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Accuracy:</span>
                    <p>±{update.accuracy}m</p>
                  </div>
                  {update.speed !== undefined && (
                    <div>
                      <span className="text-gray-600">Speed:</span>
                      <p>{update.speed.toFixed(1)} km/h</p>
                    </div>
                  )}
                  {update.batteryLevel !== undefined && (
                    <div>
                      <span className="text-gray-600">Battery:</span>
                      <p className={update.batteryLevel < 20 ? 'text-red-600 font-medium' : ''}>
                        {update.batteryLevel}%
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Confidence: {update.confidence.toFixed(1)}%</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          update.confidence >= 90 ? 'bg-green-500' :
                          update.confidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${update.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {update.notes && (
                  <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                    {update.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Geofences */}
      {geofences && geofences.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🗺️ Active Geofences</h3>
          <div className="space-y-3">
            {geofences.map((geofence) => (
              <div key={geofence._id} className="border border-gray-200 rounded p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{geofence.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{geofence.type.replace('_', ' ')}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    geofence.type === 'safe_zone' ? 'bg-green-100 text-green-800' :
                    geofence.type === 'danger_zone' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {geofence.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Alerts: {geofence.alertOnEntry ? 'Entry' : ''} {geofence.alertOnExit ? 'Exit' : ''}</p>
                  {geofence.radius && <p>Radius: {geofence.radius}m</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <button className="p-4 border border-gray-200 rounded hover:bg-gray-50 text-left">
            <div className="text-2xl mb-2">🚨</div>
            <h4 className="font-medium text-gray-900">Emergency Alert</h4>
            <p className="text-sm text-gray-600">Send immediate alert to authorities</p>
          </button>
          <button className="p-4 border border-gray-200 rounded hover:bg-gray-50 text-left">
            <div className="text-2xl mb-2">📍</div>
            <h4 className="font-medium text-gray-900">Share Location</h4>
            <p className="text-sm text-gray-600">Share current location with family</p>
          </button>
          <button className="p-4 border border-gray-200 rounded hover:bg-gray-50 text-left">
            <div className="text-2xl mb-2">🗺️</div>
            <h4 className="font-medium text-gray-900">Create Geofence</h4>
            <p className="text-sm text-gray-600">Set up safe/danger zones</p>
          </button>
          <button className="p-4 border border-gray-200 rounded hover:bg-gray-50 text-left">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-medium text-gray-900">View Map</h4>
            <p className="text-sm text-gray-600">See tracking on interactive map</p>
          </button>
        </div>
      </div>
    </div>
  );
}
