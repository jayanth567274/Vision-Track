import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

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
  const analyzeCase = useAction(api.analysis.analyzeCase);

  const handleAnalyze = async () => {
    if (!case_) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress("Initializing AI analysis...");
    
    try {
      // Simulate progress updates
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
      
      // Show email notification info
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
        
        {!case_.analysisComplete && (
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
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
            {case_.status.toUpperCase()}
          </span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">
            {case_.priority.toUpperCase()} PRIORITY
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          {case_.photoUrl && (
            <div className="mb-4">
              <img 
                src={case_.photoUrl} 
                alt="Missing person"
                className="w-full max-w-sm h-64 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Personal Details</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Age:</strong> {case_.age}</p>
              <p><strong>Gender:</strong> {case_.gender}</p>
              <p><strong>Height:</strong> {case_.height}</p>
              <p><strong>Body Type:</strong> {case_.bodyType}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Last Known Information</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Location:</strong> {case_.lastSeenLocation}</p>
              <p><strong>Date:</strong> {case_.lastSeenDate}</p>
              <p><strong>Time:</strong> {case_.lastSeenTime}</p>
              <p><strong>Clothing:</strong> {case_.clothingDescription}</p>
            </div>
          </div>

          {case_.identifyingFeatures.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Identifying Features</h3>
              <div className="flex flex-wrap gap-1">
                {case_.identifyingFeatures.map((feature: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
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
    "Contact local police department",
    "Check nearby hospitals and shelters",
    "Post on social media with photo",
    "Contact local news stations",
    "Check public transportation hubs",
    "Verify predicted locations in person",
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Recommended Actions</h3>
      
      <ul className="space-y-2">
        {actions.map((action, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
              {index + 1}
            </span>
            <span className="text-gray-700">{action}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Priority:</strong> Contact authorities immediately for cases involving minors, 
          elderly individuals, or those with medical conditions.
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
