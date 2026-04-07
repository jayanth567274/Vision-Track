import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { ThemeProvider } from "./context/ThemeContext";
import { ThemeToggle } from "./components/ThemeToggle";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { CreateCase } from "./components/CreateCase";
import { CaseDetails } from "./components/CaseDetails";
import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";

function AppContent() {
  const [currentView, setCurrentView] = useState<"dashboard" | "create" | "details">("dashboard");
  const [selectedCaseId, setSelectedCaseId] = useState<Id<"cases"> | null>(null);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/70 dark:border-slate-800/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-cyan-500/20 flex items-center justify-center text-white font-bold">
              VT
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-900 dark:text-white">Vision Track</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Insight. Track. Solve.</p>
            </div>
          </div>

          <Authenticated>
            <nav className="hidden md:flex items-center gap-2 rounded-3xl bg-white/70 dark:bg-slate-800/70 p-2 shadow-sm shadow-slate-200/60 dark:shadow-slate-950/30 backdrop-blur-md">
              <button
                onClick={() => setCurrentView("dashboard")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  currentView === "dashboard"
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView("create")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  currentView === "create"
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                New Case
              </button>
            </nav>
          </Authenticated>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignOutButton />
          </div>
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
  selectedCaseId: Id<"cases"> | null;
  setSelectedCaseId: (id: Id<"cases"> | null) => void;
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden flex items-center rounded-3xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-24 w-56 h-56 bg-blue-500/15 dark:bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-cyan-300/10 dark:bg-cyan-400/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-violet-500/10 dark:bg-violet-400/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto w-full px-4 py-16">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">Vision Track</h1>
                  <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                    Advanced AI-powered system for finding missing persons using computer vision and geospatial analysis.
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 dark:bg-blue-400/20 flex items-center justify-center mt-1">
                      <span className="text-blue-600 dark:text-blue-300 font-bold">✓</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">AI-Powered Detection</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Advanced facial recognition and pattern analysis.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 dark:bg-blue-400/20 flex items-center justify-center mt-1">
                      <span className="text-blue-600 dark:text-blue-300 font-bold">✓</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Live Tracking</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Real-time GPS and CCTV integration.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 dark:bg-blue-400/20 flex items-center justify-center mt-1">
                      <span className="text-blue-600 dark:text-blue-300 font-bold">✓</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Secure & Compliant</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Built with privacy and ethics in mind.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/80 p-5 shadow-lg shadow-slate-500/10 dark:shadow-slate-950/40">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>⚖️ Important:</strong> This system provides AI-assisted analysis for decision support only. All results require human verification and should not be used as sole evidence. Always contact local authorities.
                  </p>
                </div>
              </div>

              <div className="relative rounded-3xl border border-white/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 shadow-2xl shadow-slate-500/10 dark:shadow-slate-950/40 backdrop-blur-xl">
                <SignInForm />
              </div>
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
            onCaseSaved={(caseId) => {
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

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
