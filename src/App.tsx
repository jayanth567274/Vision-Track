import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { CreateCase } from "./components/CreateCase";
import { CaseDetails } from "./components/CaseDetails";
import { useState } from "react";

export default function App() {
  const [currentView, setCurrentView] = useState<"dashboard" | "create" | "details">("dashboard");
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-blue-600">🔍 Missing Person AI</h1>
            <Authenticated>
              <nav className="flex gap-4">
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className={`px-3 py-1 rounded ${
                    currentView === "dashboard" 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView("create")}
                  className={`px-3 py-1 rounded ${
                    currentView === "create" 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  New Case
                </button>
              </nav>
            </Authenticated>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1">
        <Content 
          currentView={currentView}
          setCurrentView={setCurrentView}
          selectedCaseId={selectedCaseId}
          setSelectedCaseId={setSelectedCaseId}
        />
      </main>
      
      <Toaster />
    </div>
  );
}

function Content({ 
  currentView, 
  setCurrentView, 
  selectedCaseId, 
  setSelectedCaseId 
}: {
  currentView: "dashboard" | "create" | "details";
  setCurrentView: (view: "dashboard" | "create" | "details") => void;
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string | null) => void;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Unauthenticated>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI-Powered Missing Person Detection
            </h2>
            <p className="text-gray-600 mb-6">
              Advanced computer vision and geospatial analysis to assist in locating missing individuals
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>⚖️ Ethical AI Notice:</strong> This system provides decision-support only. 
                All results require human verification and should not be used as sole evidence.
              </p>
            </div>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        {currentView === "dashboard" && (
          <Dashboard 
            onViewCase={(caseId) => {
              setSelectedCaseId(caseId);
              setCurrentView("details");
            }}
          />
        )}
        {currentView === "create" && (
          <CreateCase 
            onCaseCreated={(caseId) => {
              setSelectedCaseId(caseId);
              setCurrentView("details");
            }}
          />
        )}
        {currentView === "details" && selectedCaseId && (
          <CaseDetails 
            caseId={selectedCaseId}
            onBack={() => setCurrentView("dashboard")}
          />
        )}
      </Authenticated>
    </div>
  );
}
