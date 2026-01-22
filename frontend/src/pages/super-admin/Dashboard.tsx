import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [isDark, setIsDark] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);

    if (prefersDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
    {/* Header */}
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex items-center justify-between px-8 py-4">
        <h1 className="text-2xl font-semibold">
          Super Admin Dashboard
        </h1>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard/create-company")}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Create Company
          </button>

          <button
            type="button"
            onClick={toggleDarkMode}
            className="px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-sm"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </header>
      {/* Main Content */}
      <main className="px-8 py-10">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Companies */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Total Companies
            </div>
            <div className="text-3xl font-bold mb-1">--</div>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              N/A
            </div>
          </div>

          {/* Active Companies */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Active Companies
            </div>
            <div className="text-3xl font-bold mb-1">--</div>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              N/A
            </div>
          </div>

          {/* Platform Status */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Platform Status
            </div>
            <div className="text-3xl font-bold mb-1">--</div>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              N/A
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              System Health
            </div>
            <div className="text-3xl font-bold mb-1">--</div>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              N/A
            </div>
          </div>
        </div>

        {/* Grid Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  --
                </div>
              </div>
              <div className="py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  N/A
                </div>
              </div>
              <div className="py-3">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Placeholder
                </div>
              </div>
            </div>
          </div>

          {/* Platform Overview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Platform Overview</h2>
            <div className="space-y-3">
              <div className="py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  --
                </div>
              </div>
              <div className="py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  N/A
                </div>
              </div>
              <div className="py-3">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Placeholder
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
