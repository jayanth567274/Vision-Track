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
            <h1 className="text-xl font-bold text-blue-600">Missing Person AI</h1>
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
  setSelectedCaseId,
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
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 shadow-lg sm:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-indigo-100/80 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-cyan-100/80 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="text-center lg:text-left">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                AI-Powered Missing Person Detection
              </h2>
              <p className="mb-6 text-gray-600">
                Advanced computer vision and geospatial analysis to assist in
                locating missing individuals
              </p>
              <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Ethical AI Notice:</strong> This system provides
                  decision-support only. All results require human verification
                  and should not be used as sole evidence.
                </p>
              </div>
              <p className="text-sm text-slate-500">
                Built for safer, faster, and more accountable search workflows.
              </p>
            </div>

            <div className="mx-auto w-full max-w-md">
              <SignInForm />
            </div>
          </div>
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
