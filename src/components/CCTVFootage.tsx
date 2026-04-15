import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface CCTVFootageProps {
  caseId: string;
}

export function CCTVFootage({ caseId }: CCTVFootageProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const footage = useQuery(api.cctv.getCCTVFootage, { caseId: caseId as Id<"cases"> });
  const uploadFootage = useMutation(api.cctv.uploadCCTVFootage);
  const reviewFootage = useMutation(api.cctv.reviewCCTVFootage);
  const generateUploadUrl = useMutation(api.cctv.generateCCTVUploadUrl);

  const handleReview = async (footageId: string, status: "confirmed" | "rejected", notes?: string) => {
    try {
      await reviewFootage({
        footageId: footageId as Id<"cctvFootage">,
        status,
        notes,
      });
      toast.success(`Footage ${status}`);
    } catch (error) {
      toast.error("Failed to review footage");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">🎥 CCTV Footage Analysis</h3>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            📤 Upload Footage
          </button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>🤖 AI-Powered Analysis:</strong> Our system automatically analyzes CCTV footage for person detection, 
            clothing matches, and facial recognition to identify potential sightings.
          </p>
        </div>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <UploadForm 
          caseId={caseId}
          onUpload={() => {
            setShowUploadForm(false);
            toast.success("Footage uploaded successfully!");
          }}
          onCancel={() => setShowUploadForm(false)}
        />
      )}

      {/* Footage List */}
      {footage && footage.length > 0 ? (
        <div className="space-y-4">
          {footage.map((item) => (
            <FootageCard 
              key={item._id} 
              footage={item} 
              onReview={handleReview}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 text-4xl mb-3">🎥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No CCTV Footage Yet</h3>
          <p className="text-gray-600 mb-4">
            Upload footage to start CCTV analysis
          </p>
        </div>
      )}
    </div>
  );
}

function UploadForm({ caseId, onUpload, onCancel }: any) {
  const [formData, setFormData] = useState({
    location: "",
    cameraId: "",
    timestamp: "",
    coordinates: { lat: "", lng: "" },
    notes: "",
  });
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [footageType, setFootageType] = useState<"cctv" | "mobile">("cctv");
  const [isUploading, setIsUploading] = useState(false);

  const uploadFootage = useMutation(api.cctv.uploadCCTVFootage);
  const generateUploadUrl = useMutation(api.cctv.generateCCTVUploadUrl);

  const isValidMobileCameraId = (cameraId: string) => {
    const normalized = cameraId.trim().toUpperCase();
    const match = /^CAM-(\d{3})$/.exec(normalized);
    if (!match) return false;

    const cameraNumber = Number(match[1]);
    return cameraNumber >= 1 && cameraNumber <= 20;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location || !formData.cameraId || !formData.timestamp) {
      toast.error("Please fill in required fields");
      return;
    }

    if (footageType === "mobile" && !isValidMobileCameraId(formData.cameraId)) {
      toast.error("Wrong CAM ID");
      return;
    }

    setIsUploading(true);
    try {
      let videoId = undefined;

      if (selectedMedia) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedMedia.type },
          body: selectedMedia,
        });
        const json = await result.json();
        if (!result.ok) {
          throw new Error(`Upload failed: ${JSON.stringify(json)}`);
        }
        videoId = json.storageId;
      }

      await uploadFootage({
        caseId: caseId as Id<"cases">,
        location: formData.location,
        cameraId: formData.cameraId.trim().toUpperCase(),
        timestamp: new Date(formData.timestamp).getTime(),
        duration: selectedMedia ? Math.max(1, Math.floor(selectedMedia.size / 1000)) : 60, // Estimate duration
        videoId,
        footageType,
        mediaType: selectedMedia?.type,
        coordinates: formData.coordinates.lat && formData.coordinates.lng ? {
          lat: parseFloat(formData.coordinates.lat),
          lng: parseFloat(formData.coordinates.lng),
        } : undefined,
        notes: formData.notes || undefined,
      });

      onUpload();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload footage";
      toast.error(message === "Wrong CAM ID" ? "Wrong CAM ID" : "Failed to upload footage");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Upload CCTV Footage</h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Footage Type:</span>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="footageType"
              value="cctv"
              checked={footageType === "cctv"}
              onChange={() => setFootageType("cctv")}
              className="text-blue-600 focus:ring-blue-500"
            />
            CCTV Video
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="footageType"
              value="mobile"
              checked={footageType === "mobile"}
              onChange={() => setFootageType("mobile")}
              className="text-blue-600 focus:ring-blue-500"
            />
            Mobile Video
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Camera Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Main Street Camera #12"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Camera ID *
            </label>
            <input
              type="text"
              value={formData.cameraId}
              onChange={(e) => setFormData(prev => ({ ...prev, cameraId: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., CAM-001"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timestamp *
          </label>
          <input
            type="datetime-local"
            value={formData.timestamp}
            onChange={(e) => setFormData(prev => ({ ...prev, timestamp: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latitude (Optional)
            </label>
            <input
              type="number"
              step="any"
              value={formData.coordinates.lat}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                coordinates: { ...prev.coordinates, lat: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="40.7589"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitude (Optional)
            </label>
            <input
              type="number"
              step="any"
              value={formData.coordinates.lng}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                coordinates: { ...prev.coordinates, lng: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="-73.9851"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {footageType === "mobile" ? "Mobile Video File (Optional)" : "Video File (Optional)"}
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setSelectedMedia(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Additional information about the footage..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Upload Footage"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FootageCard({ footage, onReview }: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "reviewed": return "bg-blue-100 text-blue-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-semibold text-gray-900">{footage.location}</h4>
          <p className="text-sm text-gray-600">Camera: {footage.cameraId}</p>
          <p className="text-sm text-gray-600">
            {new Date(footage.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(footage.status)}`}>
            {footage.status.toUpperCase()}
          </span>
          <span className={`text-sm font-medium ${getConfidenceColor(footage.confidence)}`}>
            {footage.confidence.toFixed(1)}%
          </span>
        </div>
      </div>

      {footage.aiAnalysis && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h5 className="font-medium text-gray-900 mb-2">🤖 AI Analysis Results</h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Person Status:</span>
              <span className={`ml-2 font-medium ${footage.aiAnalysis.personDetected ? 'text-green-600' : 'text-red-600'}`}>
                {footage.aiAnalysis.personDetected ? 'Person identified' : 'Person not identified'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Clothing Match:</span>
              <span className="ml-2 font-medium">{footage.aiAnalysis.clothingMatch.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-600">Facial Match:</span>
              <span className="ml-2 font-medium">{footage.aiAnalysis.facialMatch.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-600">Movement:</span>
              <span className="ml-2">{footage.aiAnalysis.movementPattern}</span>
            </div>
          </div>
        </div>
      )}

      {footage.videoUrl && (
        <div className="mb-4 flex justify-center">
          <video 
            controls 
            className="block w-full max-w-4xl aspect-video object-contain object-center bg-black rounded-lg shadow-sm"
            poster={footage.thumbnailUrl}
          >
            <source src={footage.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {footage.status === "confirmed" && footage.coordinates && (
        <div className="mb-4 text-sm text-gray-600">
          <span className="font-medium">📍 Location:</span> 
          {footage.coordinates.lat.toFixed(6)}, {footage.coordinates.lng.toFixed(6)}
        </div>
      )}

      {footage.status === "confirmed" && footage.coordinates && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <h5 className="font-medium text-emerald-900 mb-2">🗺️ Map View</h5>
          <p className="text-sm text-emerald-800">
            This confirmed sighting will appear on the map view.
          </p>
          <p className="text-sm text-emerald-800 mt-2 font-mono">
            {footage.coordinates.lat.toFixed(6)}, {footage.coordinates.lng.toFixed(6)}
          </p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${footage.coordinates.lat},${footage.coordinates.lng}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center mt-3 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Open in Google Maps
          </a>
        </div>
      )}

      {footage.status === "rejected" && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm text-rose-800">
            This CCTV footage was rejected, so no map view is shown.
          </p>
        </div>
      )}

      {footage.notes && (
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">{footage.notes}</p>
        </div>
      )}

      {footage.status === "pending" || footage.status === "reviewed" ? (
        <div className="flex gap-2">
          <button
            onClick={() => onReview(footage._id, "confirmed", "Confirmed sighting")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            ✓ Confirm Sighting
          </button>
          <button
            onClick={() => onReview(footage._id, "rejected", "Not a match")}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            ✗ Reject
          </button>
        </div>
      ) : (
        <div className="text-sm text-gray-600">
          Reviewed by {footage.reviewedBy ? 'user' : 'system'} on {new Date(footage.reviewedAt || footage._creationTime).toLocaleString()}
        </div>
      )}
    </div>
  );
}
