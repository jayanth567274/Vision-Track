import React from "react";
import { User, Mail, Phone } from "lucide-react";

interface ProfileProps {
  user: {
    name: string;
    email: string;
    joinedAsGuest: boolean;
  };
}

export function Profile({ user }: ProfileProps) {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Profile</h1>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <User className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          <div>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Name</h2>
            <p className="text-slate-600 dark:text-slate-400">
              {user.joinedAsGuest ? "Guest" : user.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Mail className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          <div>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Email</h2>
            <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Help() {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Help</h1>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Mail className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          <div>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Email</h2>
            <p className="text-slate-600 dark:text-slate-400">
              <a href="mailto:jvsai151204@gmail.com" className="text-blue-600 dark:text-blue-400">
                jvsai151204@gmail.com
              </a>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Phone className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          <div>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Phone</h2>
            <p className="text-slate-600 dark:text-slate-400">
              <a href="tel:+7075995680" className="text-blue-600 dark:text-blue-400">
                7075995680
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage({ user }: ProfileProps) {
  const [activeTab, setActiveTab] = React.useState("profile");

  return (
    <div className="p-6">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "profile"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("help")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "help"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          }`}
        >
          Help
        </button>
      </div>

      <button
        onClick={() => (window.location.href = "/")}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        Back to Dashboard
      </button>

      {activeTab === "profile" && <Profile user={user} />}
      {activeTab === "help" && <Help />}
    </div>
  );
}