import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface DashboardProps {
  onViewCase: (caseId: string) => void;
}

export function Dashboard({ onViewCase }: DashboardProps) {
  const cases = useQuery(api.cases.getCases) || [];

  const activeCases = cases.filter(c => c.status === "active");
  const resolvedCases = cases.filter(c => c.status === "resolved");

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Case Dashboard</h2>
        <div className="flex gap-4 text-sm">
          <div className="bg-blue-100 px-3 py-1 rounded">
            <span className="text-blue-700 font-medium">{activeCases.length} Active</span>
          </div>
          <div className="bg-green-100 px-3 py-1 rounded">
            <span className="text-green-700 font-medium">{resolvedCases.length} Resolved</span>
          </div>
        </div>
      </div>

      {cases.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cases yet</h3>
          <p className="text-gray-600 mb-4">Create your first missing person case to get started</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((case_) => (
            <CaseCard 
              key={case_._id} 
              case_={case_} 
              onView={() => onViewCase(case_._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CaseCard({ case_, onView }: { case_: any; onView: () => void }) {
  const statusColors = {
    active: "bg-blue-100 text-blue-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
  };

  const priorityColors = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{case_.personName}</h3>
          <p className="text-sm text-gray-600">Case #{case_.caseId}</p>
        </div>
        <div className="flex flex-col gap-1">
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[case_.status as keyof typeof statusColors]}`}>
            {case_.status.toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[case_.priority as keyof typeof priorityColors]}`}>
            {case_.priority.toUpperCase()}
          </span>
        </div>
      </div>

      {case_.photoUrl && (
        <div className="mb-4">
          <img 
            src={case_.photoUrl} 
            alt="Missing person"
            className="w-full h-32 object-cover rounded"
          />
        </div>
      )}

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p><strong>Age:</strong> {case_.age}</p>
        <p><strong>Last seen:</strong> {case_.lastSeenLocation}</p>
        <p><strong>Date:</strong> {case_.lastSeenDate}</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {case_.analysisComplete ? (
            <span className="text-green-600">✓ Analysis Complete</span>
          ) : (
            <span className="text-yellow-600">⏳ Pending Analysis</span>
          )}
        </div>
        <button
          onClick={onView}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
