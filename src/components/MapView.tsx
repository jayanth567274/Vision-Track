import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface MapViewProps {
  caseId: string;
  case_: any;
}

export function MapView({ caseId, case_ }: MapViewProps) {
  const [mapCenter, setMapCenter] = useState({ lat: 40.7589, lng: -73.9851 });
  const [zoom, setZoom] = useState(13);
  const [selectedLayer, setSelectedLayer] = useState<'tracking' | 'cctv' | 'geofences' | 'all'>('all');
  
  const trackingUpdates = useQuery(api.tracking.getTrackingUpdates, { 
    caseId: caseId as Id<"cases">,
    limit: 50 
  });
  const cctvFootage = useQuery(api.cctv.getCCTVFootage, { 
    caseId: caseId as Id<"cases"> 
  });
  const geofences = useQuery(api.tracking.getGeofences, { 
    caseId: caseId as Id<"cases"> 
  });

  // Set map center to last known location if available
  useEffect(() => {
    if (case_?.lastKnownCoordinates) {
      setMapCenter({
        lat: case_.lastKnownCoordinates.lat,
        lng: case_.lastKnownCoordinates.lng
      });
    }
  }, [case_]);

  const getTrackingPath = () => {
    if (!trackingUpdates) return [];
    return trackingUpdates
      .sort((a, b) => a._creationTime - b._creationTime)
      .map(update => ({
        lat: update.coordinates.lat,
        lng: update.coordinates.lng,
        timestamp: update._creationTime,
        confidence: update.confidence,
        source: update.source
      }));
  };

  const getCCTVLocations = () => {
    if (!cctvFootage) return [];
    return cctvFootage
      .filter(footage => footage.coordinates)
      .map(footage => ({
        lat: footage.coordinates!.lat,
        lng: footage.coordinates!.lng,
        location: footage.location,
        confidence: footage.confidence,
        status: footage.status,
        timestamp: footage.timestamp
      }));
  };

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">🗺️ Interactive Map View</h3>
          <div className="flex gap-2">
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Layers</option>
              <option value="tracking">Tracking Only</option>
              <option value="cctv">CCTV Only</option>
              <option value="geofences">Geofences Only</option>
            </select>
            <button
              onClick={() => {
                if (case_?.lastKnownCoordinates) {
                  setMapCenter({
                    lat: case_.lastKnownCoordinates.lat,
                    lng: case_.lastKnownCoordinates.lng
                  });
                  setZoom(15);
                }
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              📍 Center on Last Location
            </button>
          </div>
        </div>

        {/* Layer Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          {(selectedLayer === 'all' || selectedLayer === 'tracking') && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Tracking Path</span>
            </div>
          )}
          {(selectedLayer === 'all' || selectedLayer === 'cctv') && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>CCTV Cameras</span>
            </div>
          )}
          {(selectedLayer === 'all' || selectedLayer === 'geofences') && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded border-2 border-green-300"></div>
              <span>Geofences</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <span>Current Location</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <SimpleMap
          center={mapCenter}
          zoom={zoom}
          trackingPath={selectedLayer === 'all' || selectedLayer === 'tracking' ? getTrackingPath() : []}
          cctvLocations={selectedLayer === 'all' || selectedLayer === 'cctv' ? getCCTVLocations() : []}
          geofences={selectedLayer === 'all' || selectedLayer === 'geofences' ? geofences || [] : []}
          currentLocation={case_?.lastKnownCoordinates}
          onCenterChange={setMapCenter}
          onZoomChange={setZoom}
        />
      </div>

      {/* Map Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {trackingUpdates?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Tracking Points</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {cctvFootage?.length || 0}
          </div>
          <div className="text-sm text-gray-600">CCTV Locations</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {geofences?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Active Geofences</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {case_?.lastKnownCoordinates ? 
              `${case_.lastKnownCoordinates.accuracy}m` : 'N/A'
            }
          </div>
          <div className="text-sm text-gray-600">GPS Accuracy</div>
        </div>
      </div>

      {/* Location Details */}
      {case_?.lastKnownCoordinates && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">📍 Current Location Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Latitude:</span>
              <p className="font-mono text-gray-900">{case_.lastKnownCoordinates.lat.toFixed(6)}</p>
            </div>
            <div>
              <span className="text-gray-600">Longitude:</span>
              <p className="font-mono text-gray-900">{case_.lastKnownCoordinates.lng.toFixed(6)}</p>
            </div>
            <div>
              <span className="text-gray-600">Accuracy:</span>
              <p className="text-gray-900">±{case_.lastKnownCoordinates.accuracy}m</p>
            </div>
            <div>
              <span className="text-gray-600">Last Update:</span>
              <p className="text-gray-900">
                {new Date(case_.lastKnownCoordinates.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                const coords = `${case_.lastKnownCoordinates.lat},${case_.lastKnownCoordinates.lng}`;
                window.open(`https://www.google.com/maps?q=${coords}`, '_blank');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              🗺️ Open in Google Maps
            </button>
            <button
              onClick={() => {
                const coords = `${case_.lastKnownCoordinates.lat},${case_.lastKnownCoordinates.lng}`;
                navigator.clipboard.writeText(coords);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              📋 Copy Coordinates
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple map component using HTML5 Canvas
function SimpleMap({ 
  center, 
  zoom, 
  trackingPath, 
  cctvLocations, 
  geofences, 
  currentLocation,
  onCenterChange,
  onZoomChange 
}: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    drawMap();
  }, [center, zoom, trackingPath, cctvLocations, geofences, currentLocation]);

  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Convert lat/lng to canvas coordinates
    const toCanvasCoords = (lat: number, lng: number) => {
      const scale = Math.pow(2, zoom - 10);
      const x = canvas.width / 2 + (lng - center.lng) * scale * 100000;
      const y = canvas.height / 2 - (lat - center.lat) * scale * 100000;
      return { x, y };
    };

    // Draw geofences
    geofences.forEach((geofence: any) => {
      if (geofence.coordinates && geofence.coordinates.length > 0) {
        ctx.strokeStyle = geofence.type === 'safe_zone' ? '#10b981' : 
                         geofence.type === 'danger_zone' ? '#ef4444' : '#3b82f6';
        ctx.fillStyle = geofence.type === 'safe_zone' ? '#10b98120' : 
                       geofence.type === 'danger_zone' ? '#ef444420' : '#3b82f620';
        ctx.lineWidth = 2;
        
        const coords = geofence.coordinates.map((coord: any) => toCanvasCoords(coord.lat, coord.lng));
        
        if (geofence.radius) {
          // Draw circle
          const center = coords[0];
          const radiusPixels = geofence.radius * Math.pow(2, zoom - 10) * 0.1;
          ctx.beginPath();
          ctx.arc(center.x, center.y, radiusPixels, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        } else {
          // Draw polygon
          ctx.beginPath();
          coords.forEach((coord: { x: number; y: number }, i: number) => {
            if (i === 0) ctx.moveTo(coord.x, coord.y);
            else ctx.lineTo(coord.x, coord.y);
          });
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
    });

    // Draw tracking path
    if (trackingPath.length > 1) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      trackingPath.forEach((point: any, i: number) => {
        const coords = toCanvasCoords(point.lat, point.lng);
        if (i === 0) ctx.moveTo(coords.x, coords.y);
        else ctx.lineTo(coords.x, coords.y);
      });
      ctx.stroke();

      // Draw tracking points
      trackingPath.forEach((point: any, i: number) => {
        const coords = toCanvasCoords(point.lat, point.lng);
        const confidence = point.confidence / 100;
        
        ctx.fillStyle = `rgba(59, 130, 246, ${confidence})`;
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add confidence indicator
        ctx.strokeStyle = confidence > 0.8 ? '#10b981' : confidence > 0.6 ? '#f59e0b' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    // Draw CCTV locations
    cctvLocations.forEach((cctv: any) => {
      const coords = toCanvasCoords(cctv.lat, cctv.lng);
      
      // Draw camera icon (rectangle)
      ctx.fillStyle = cctv.status === 'confirmed' ? '#10b981' : 
                     cctv.status === 'rejected' ? '#ef4444' : '#f59e0b';
      ctx.fillRect(coords.x - 6, coords.y - 6, 12, 12);
      
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 1;
      ctx.strokeRect(coords.x - 6, coords.y - 6, 12, 12);
      
      // Add confidence text
      ctx.fillStyle = '#1f2937';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${cctv.confidence.toFixed(0)}%`, coords.x, coords.y + 20);
    });

    // Draw current location
    if (currentLocation) {
      const coords = toCanvasCoords(currentLocation.lat, currentLocation.lng);
      
      // Pulsing circle
      const time = Date.now() / 1000;
      const pulseRadius = 8 + Math.sin(time * 3) * 3;
      
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, pulseRadius, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Inner dot
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    const scale = Math.pow(2, zoom - 10);
    const latDelta = deltaY / (scale * 100000);
    const lngDelta = -deltaX / (scale * 100000);
    
    onCenterChange({
      lat: center.lat + latDelta,
      lng: center.lng + lngDelta
    });
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = Math.max(8, Math.min(18, zoom - e.deltaY * 0.01));
    onZoomChange(newZoom);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="w-full h-96 cursor-move border border-gray-200"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-1">
        <button
          onClick={() => onZoomChange(Math.min(18, zoom + 1))}
          className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
        >
          +
        </button>
        <button
          onClick={() => onZoomChange(Math.max(8, zoom - 1))}
          className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
        >
          −
        </button>
      </div>
      
      {/* Coordinates display */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-mono">
        {center.lat.toFixed(4)}, {center.lng.toFixed(4)} | Zoom: {zoom.toFixed(1)}
      </div>
    </div>
  );
}
