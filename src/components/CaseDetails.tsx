import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { LiveTracking } from "./LiveTracking";
import { CCTVFootage } from "./CCTVFootage";
import { MapView } from "./MapView";

interface CaseDetailsProps {
  caseId: string;
  onBack: () => void;
}

export function CaseDetails({ caseId, onBack }: CaseDetailsProps) {
  const case_ = useQuery(api.cases.getCase, { caseId: caseId as Id<"cases"> });
  const matches = useQuery(api.matches.getMatches, { caseId: caseId as Id<"cases"> });
  const predictions = useQuery(api.matches.getPredictions, { caseId: caseId as Id<"cases"> });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "analysis" | "tracking" | "cctv" | "map">("overview");
  const analyzeCase = useAction(api.analysis.analyzeCase);

  const handleAnalyze = async () => {
    if (!case_) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress("Initializing AI analysis...");
    
    try {
      setTimeout(() => setAnalysisProgress("Processing facial features..."), 500);
      setTimeout(() => setAnalysisProgress("Analyzing visual markers..."), 1000);
      setTimeout(() => setAnalysisProgress("Generating location predictions..."), 1500);
      setTimeout(() => setAnalysisProgress("Searching for potential matches..."), 2000);
      
      await analyzeCase({
        caseId: case_._id,
        personName: case_.personName,
        age: case_.age,
        lastSeenLocation: case_.lastSeenLocation,
        clothingDescription: case_.clothingDescription,
        identifyingFeatures: case_.identifyingFeatures,
        photoUrl: case_.photoUrl || undefined,
      });
      
      setAnalysisProgress("Analysis completed successfully!");
      toast.success("🎯 AI Analysis completed! Check the results below.");
      
      if (case_.reporterEmail) {
        setTimeout(() => {
          toast.info(`📧 Analysis results sent to ${case_.reporterEmail}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("❌ Analysis failed. Please try again.");
      setAnalysisProgress("");
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisProgress("");
      }, 1000);
    }
  };

  if (!case_) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          ← Back to Dashboard
        </button>
        
        {!case_.analysisComplete && activeTab === "analysis" && (
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  "Analyzing..."
                </>
              ) : (
                "🔍 Start AI Analysis"
              )}
            </button>
            {analysisProgress && (
              <p className="text-sm text-blue-600 animate-pulse">{analysisProgress}</p>
            )}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            📋 Case Overview
          </button>
          <button
            onClick={() => setActiveTab("analysis")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "analysis"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            🤖 AI Analysis
          </button>
          <button
            onClick={() => setActiveTab("tracking")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "tracking"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            📍 Live Tracking
          </button>
          <button
            onClick={() => setActiveTab("cctv")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "cctv"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            🎥 CCTV Footage
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "map"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            🗺️ Map View
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <CaseSummary case_={case_} />
            <LastSeenDetails case_={case_} />
          </div>
          <div className="space-y-6">
            <RecommendedActions case_={case_} />
            <EthicalDisclaimer />
          </div>
        </div>
      )}

      {activeTab === "analysis" && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <CaseSummary case_={case_} />
            
            {case_.analysisComplete && (
              <>
                <VisualAnalysis case_={case_} />
                <PotentialMatches matches={matches || []} />
              </>
            )}
          </div>

          <div className="space-y-6">
            {case_.analysisComplete && predictions && (
              <LocationPredictions predictions={predictions} />
            )}
            <RecommendedActions case_={case_} />
            <EthicalDisclaimer />
          </div>
        </div>
      )}

      {activeTab === "tracking" && (
        <LiveTracking caseId={caseId} case_={case_} />
      )}

      {activeTab === "cctv" && (
        <CCTVFootage caseId={caseId} />
      )}

      {activeTab === "map" && (
        <MapView caseId={caseId} case_={case_} />
      )}
    </div>
  );
}

function CaseSummary({ case_ }: { case_: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{case_.personName}</h2>
          <p className="text-gray-600">Case #{case_.caseId}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
            {case_.status.toUpperCase()}
          </span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">
            {case_.priority.toUpperCase()} PRIORITY
          </span>
          {case_.liveTrackingEnabled && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
              📍 LIVE TRACKING
            </span>
          )}
          {case_.analysisComplete && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm font-medium">
              🤖 AI ANALYZED
            </span>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          {case_.photoUrl && (
            <div className="mb-4">
              <img 
                src={case_.photoUrl} 
                alt="Missing person"
                className="w-full max-w-sm h-64 object-cover rounded-lg border-2 border-gray-200"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">👤 Personal Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Age:</span>
                <span className="font-medium">{case_.age} years old</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gender:</span>
                <span className="font-medium capitalize">{case_.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Height:</span>
                <span className="font-medium">{case_.height || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Body Type:</span>
                <span className="font-medium capitalize">{case_.bodyType || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {case_.identifyingFeatures.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🔍 Identifying Features</h3>
              <div className="flex flex-wrap gap-1">
                {case_.identifyingFeatures.map((feature: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {case_.lastKnownCoordinates && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📍 Current GPS Location</h3>
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-800">LIVE LOCATION</span>
                </div>
                <p className="text-sm text-green-800">
                  <strong>Coordinates:</strong> {case_.lastKnownCoordinates.lat.toFixed(6)}, {case_.lastKnownCoordinates.lng.toFixed(6)}
                  <br />
                  <strong>Accuracy:</strong> ±{case_.lastKnownCoordinates.accuracy}m
                  <br />
                  <strong>Last Update:</strong> {new Date(case_.lastKnownCoordinates.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LastSeenDetails({ case_ }: { case_: any }) {
  const timeElapsed = Math.floor((Date.now() - new Date(`${case_.lastSeenDate}T${case_.lastSeenTime}`).getTime()) / (1000 * 60 * 60));
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Last Known Information</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">⏰ Time Critical</h4>
            <p className="text-sm text-red-800">
              <strong>{timeElapsed} hours</strong> have passed since last sighting
            </p>
            <div className="mt-2 w-full bg-red-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(timeElapsed * 2, 100)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">📍 Location Details</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Address:</span>
                <p className="font-medium text-gray-900">{case_.lastSeenLocation}</p>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date(case_.lastSeenDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{case_.lastSeenTime}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">👕 Clothing Description</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              {case_.clothingDescription || 'No clothing description provided'}
            </p>
          </div>

          {case_.behavioralPatterns && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">🧠 Behavioral Patterns</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">{case_.behavioralPatterns}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-yellow-600 text-xl">⚠️</div>
          <div>
            <h4 className="font-medium text-yellow-900">Search Priority Assessment</h4>
            <p className="text-sm text-yellow-800 mt-1">
              Based on the time elapsed and person's profile, this case requires 
              <strong className="ml-1">
                {timeElapsed < 24 ? 'IMMEDIATE' : timeElapsed < 72 ? 'HIGH' : 'CONTINUED'}
              </strong> attention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisualAnalysis({ case_ }: { case_: any }) {
  if (!case_.faceAnalysis) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Visual Analysis Report</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Facial Landmarks Detected</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            {case_.faceAnalysis.facialLandmarks.map((landmark: string, index: number) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                {landmark}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Visual Markers</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            {case_.faceAnalysis.visualMarkers.map((marker: string, index: number) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                {marker}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded">
        <p className="text-sm text-blue-800">
          <strong>Analysis Confidence:</strong> {case_.faceAnalysis.confidence.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}

function PotentialMatches({ matches }: { matches: any[] }) {
  const verifyMatch = useMutation(api.matches.verifyMatch);

  const handleVerify = async (matchId: string, verified: boolean) => {
    try {
      await verifyMatch({
        matchId: matchId as Id<"matches">,
        verified,
        notes: verified ? "Verified by user" : "Rejected by user",
      });
      toast.success(verified ? "Match verified" : "Match rejected");
    } catch (error) {
      toast.error("Failed to update match");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Potential Matches</h3>
      
      {matches.length === 0 ? (
        <p className="text-gray-600 text-center py-4">No matches found yet.</p>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {match.matchType.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      match.confidence >= 80 
                        ? "bg-green-100 text-green-800"
                        : match.confidence >= 60
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {match.confidence.toFixed(1)}% Match
                    </span>
                  </div>
                  <p className="font-medium text-gray-900">{match.location}</p>
                  <p className="text-sm text-gray-600">{match.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(match.timestamp).toLocaleString()}
                  </p>
                </div>
                
                {!match.verified && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerify(match._id, true)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleVerify(match._id, false)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
              
              {match.notes && (
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Notes:</strong> {match.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LocationPredictions({ predictions }: { predictions: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Heat-Zone Predictions</h3>
      
      <div className="space-y-4">
        {predictions.predictedLocations.map((location: any, index: number) => (
          <div key={index} className="border-l-4 border-blue-500 pl-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900">{location.area}</h4>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                {location.probability.toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-gray-600">{location.reasoning}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded">
        <p className="text-sm text-gray-700">
          <strong>Movement Pattern:</strong> {predictions.movementPattern}
        </p>
        <p className="text-sm text-gray-700 mt-1">
          <strong>Time Elapsed:</strong> {predictions.timeElapsed} hours
        </p>
      </div>
    </div>
  );
}

function RecommendedActions({ case_ }: { case_: any }) {
  const actions = [
    "Contact local police department immediately",
    "Check nearby hospitals and shelters",
    "Post on social media with photo and details",
    "Contact local news stations for coverage",
    "Check public transportation hubs and stations",
    "Verify predicted locations in person",
    "Review CCTV footage from surrounding areas",
    "Contact friends, family, and known associates",
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Recommended Actions</h3>
      
      <ul className="space-y-2">
        {actions.map((action, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
              {index + 1}
            </span>
            <span className="text-gray-700">{action}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
        <p className="text-sm text-red-800">
          <strong>🚨 URGENT:</strong> The first 24-48 hours are critical. Contact authorities immediately 
          for cases involving minors, elderly individuals, or those with medical conditions.
        </p>
      </div>
    </div>
  );
}

function EthicalDisclaimer() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">⚖️ Ethical & Technical Disclaimer</h3>
      
      <div className="space-y-3 text-sm text-gray-700">
        <p>
          <strong>Decision Support Only:</strong> This AI system provides analysis to assist human decision-making. 
          All results require verification by trained professionals.
        </p>
        
        <p>
          <strong>No Identity Confirmation:</strong> The system cannot definitively confirm identity. 
          All matches are probabilistic and must be investigated.
        </p>
        
        <p>
          <strong>Privacy & Bias:</strong> We are committed to protecting privacy and minimizing algorithmic bias. 
          Results should be interpreted with awareness of potential limitations.
        </p>
        
        <p>
          <strong>Legal Compliance:</strong> Always follow local laws and official procedures. 
          This tool supplements but does not replace proper authorities.
        </p>
      </div>
    </div>
  );
}
