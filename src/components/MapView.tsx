import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface MapViewProps {
  caseId: string;
}

export function MapView({ caseId }: MapViewProps) {
  const [mapCenter, setMapCenter] = useState({ lat: 12.906002, lng: 80.140521 });
  const [zoom, setZoom] = useState(13);
  const [selectedLayer, setSelectedLayer] = useState<'cctv' | 'geofences' | 'all'>('all');
  
  const cctvFootage = useQuery(api.cctv.getCCTVFootage, { 
    caseId: caseId as Id<"cases"> 
  });
  const geofences = useQuery(api.tracking.getGeofences, { 
    caseId: caseId as Id<"cases"> 
  });

  const getCCTVLocations = () => {
    if (!cctvFootage) return [];
    return cctvFootage
      .filter(footage => footage.coordinates && footage.status === "confirmed")
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">🗺️ Interactive Map View</h3>
          <div className="flex gap-3">
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Layers</option>
              <option value="cctv">CCTV Only</option>
              <option value="geofences">Geofences Only</option>
            </select>
          </div>
        </div>

        {/* Layer Legend */}
        <div className="flex flex-wrap gap-6 text-sm border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
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
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <SimpleMap
          center={mapCenter}
          zoom={zoom}
          cctvLocations={selectedLayer === 'all' || selectedLayer === 'cctv' ? getCCTVLocations() : []}
          geofences={selectedLayer === 'all' || selectedLayer === 'geofences' ? geofences || [] : []}
          onCenterChange={setMapCenter}
          onZoomChange={setZoom}
        />
      </div>

      {/* Map Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {cctvFootage?.filter((footage) => footage.status === "confirmed").length || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Confirmed CCTV Locations</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {geofences?.length || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Geofences</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {selectedLayer === "all" ? "2" : "1"}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Visible Layers</div>
        </div>
      </div>
    </div>
  );
}

// Simple map component using HTML5 Canvas
function SimpleMap({ 
  center, 
  zoom, 
  cctvLocations, 
  geofences, 
  onCenterChange,
  onZoomChange 
}: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    drawMap();
  }, [center, zoom, cctvLocations, geofences]);

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
