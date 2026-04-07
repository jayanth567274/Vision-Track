import React, { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Plus, AlertCircle, CheckCircle2, Clock, Menu, Home, FileText, MapPin, Settings, Search } from "lucide-react";
import { CreateCase } from "./CreateCase";
import SettingsPage from "./Settings";

interface DashboardProps {
  onViewCase: (caseId: Id<"cases">) => void;
}

export function Dashboard({ onViewCase }: DashboardProps) {
  const cases = useQuery(api.cases.getCases) || [];

  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vt:sidebarCollapsed");
      if (saved !== null) setCollapsed(saved === "true");
    } catch (e) {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem("vt:sidebarCollapsed", String(collapsed)); } catch (e) { /* ignore */ }
  }, [collapsed]);

  const activeCases = cases.filter(c => c.status === "active");
  const resolvedCases = cases.filter(c => c.status === "resolved");

  return (
    <div className="flex gap-8">
      {/* Sidebar placeholder (collapsible) */}
      <aside className={`hidden md:block ${collapsed ? "w-20" : "w-64"} shrink-0`}>
        <div className="rounded-2xl p-3 bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 shadow-sm backdrop-blur-md h-full">
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-semibold text-slate-800 dark:text-white transition-opacity ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>Navigation</h4>
            <button aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
          <nav className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 ${collapsed ? 'justify-center' : ''}`}>
              <Home className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span className={`${collapsed ? 'hidden' : 'inline'}`}>Dashboard</span>
            </button>
            <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 ${collapsed ? 'justify-center' : ''}`}>
              <FileText className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span className={`${collapsed ? 'hidden' : 'inline'}`}>Cases</span>
            </button>
            <button
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 ${collapsed ? 'justify-center' : ''}`}
              onClick={() => window.location.href = '/settings'}
            >
              <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span className={`${collapsed ? 'hidden' : 'inline'}`}>Settings</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Good morning</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Here’s what’s happening with missing person cases</p>
          </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-full px-3 py-1">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search person, location, case #"
                  className="bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200 w-48"
                />
              </div>

              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-sm">
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatsCard
            icon={<AlertCircle className="text-red-500" />}
            title="Active Cases"
            value={activeCases.length}
            bgColor="bg-red-50 dark:bg-red-900/20"
          />
          <StatsCard
            icon={<CheckCircle2 className="text-green-500" />}
            title="Resolved"
            value={resolvedCases.length}
            bgColor="bg-green-50 dark:bg-green-900/20"
          />
          <StatsCard
            icon={<Clock className="text-blue-500" />}
            title="Total Cases"
            value={cases.length}
            bgColor="bg-blue-50 dark:bg-blue-900/20"
          />
          <StatsCard
            icon={<AlertCircle className="text-amber-500" />}
            title="Pending Analysis"
            value={cases.filter(c => !c.analysisComplete).length}
            bgColor="bg-amber-50 dark:bg-amber-900/20"
          />
        </div>

        {/* Recent Cases Table */}
        <section className="rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 p-4 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Cases</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Showing latest {Math.min(cases.length, 6)} cases</p>
          </div>

          {cases.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🔍</span>
              </div>
              <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No cases yet</h4>
              <p className="text-slate-600 dark:text-slate-400">Create your first case to begin tracking.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-600 dark:text-slate-400">
                    <th className="px-3 py-2">Person</th>
                    <th className="px-3 py-2">Age</th>
                    <th className="px-3 py-2">Last Seen</th>
                    <th className="px-3 py-2">Location</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Priority</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {cases
                    .filter((c) => {
                      // apply status filter
                      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
                      // apply search
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        String(c.personName || "").toLowerCase().includes(q) ||
                        String(c.lastSeenLocation || "").toLowerCase().includes(q) ||
                        String(c.caseId || "").toLowerCase().includes(q)
                      );
                    })
                    .slice(0, 6)
                    .map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="px-3 py-3">
                        <div className="font-medium text-slate-900 dark:text-white">{c.personName}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Case #{c.caseId}</div>
                      </td>
                      <td className="px-3 py-3">{c.age}</td>
                      <td className="px-3 py-3">{c.lastSeenDate}</td>
                      <td className="px-3 py-3 truncate max-w-xs">{c.lastSeenLocation}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300">{c.status}</span>
                      </td>
                      <td className="px-3 py-3">{c.priority}</td>
                      <td className="px-3 py-3">
                        <button onClick={() => onViewCase(c._id)} className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* CreateCase modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
            <div className="relative w-full max-w-3xl mx-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200/60 dark:border-slate-700/60">
                <CreateCase
                  onCaseSaved={(newCaseId) => {
                    setShowCreate(false);
                    // navigate to the created case
                    onViewCase(newCaseId as Id<"cases">);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatsCard({ icon, title, value, bgColor }: any) {
  return (
    <div className={`rounded-3xl p-6 border border-gray-200/70 dark:border-gray-700/70 bg-white/80 dark:bg-slate-900/75 backdrop-blur-md shadow-sm shadow-slate-900/5 ${bgColor}`}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm shadow-slate-900/10">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function CaseCard({ case_, onView }: { case_: any; onView: () => void }) {
  const statusColors = {
    active: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300",
    resolved: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300",
    closed: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300",
  };

  const priorityColors = {
    high: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300",
    medium: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300",
    low: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300",
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/70 dark:border-slate-700/70 shadow-lg shadow-slate-900/10 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{case_.personName}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Case #{case_.caseId}</p>
        </div>
        <div className="flex flex-col gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[case_.status as keyof typeof statusColors]}`}>
            {case_.status === "active" ? "🔴" : case_.status === "resolved" ? "✅" : "⭕"} {case_.status.toUpperCase()}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[case_.priority as keyof typeof priorityColors]}`}>
            {case_.priority === "high" ? "🔥" : case_.priority === "medium" ? "⚠️" : "ℹ️"} {case_.priority.toUpperCase()}
          </span>
        </div>
      </div>

      {case_.photoUrl && (
        <div className="mb-4 rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
          <img 
            src={case_.photoUrl} 
            alt="Missing person"
            className="w-full h-44 object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}

      <div className="space-y-3 text-sm mb-4 border-t border-slate-200/70 dark:border-slate-700/70 pt-4">
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Age:</span>
          <span className="font-semibold text-slate-900 dark:text-white">{case_.age} years</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Last seen:</span>
          <span className="font-semibold text-slate-900 dark:text-white">{case_.lastSeenDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Location:</span>
          <span className="font-semibold text-slate-900 dark:text-white truncate">{case_.lastSeenLocation}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4 border-t border-slate-200/70 dark:border-slate-700/70">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="text-xs">
            {case_.analysisComplete ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">✓ Analysis Complete</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">⏳ Pending Analysis</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onView}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-2xl transition-colors font-medium text-sm"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

<button
            onClick={() => {
              document.documentElement.classList.toggle("dark");
              const isDark = document.documentElement.classList.contains("dark");
              localStorage.setItem("theme", isDark ? "dark" : "light");
            }}
            className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
          >
            Toggle Theme
          </button>
