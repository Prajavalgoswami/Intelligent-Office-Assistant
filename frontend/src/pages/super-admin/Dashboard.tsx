import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardStats, type DashboardStats } from "../../api/superAdmin.api";

export default function Dashboard() {
  const [isDark, setIsDark] = React.useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/super-admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between px-8 py-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Super Admin Dashboard
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Manage companies and platform settings
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard/create-company")}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              Create Company
            </button>

            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-lg transition-colors"
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {/* Total Companies */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Companies
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1.5">{stats?.total_companies || 0}</div>
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  All time
                </div>
              </div>

              {/* Active Companies */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Active Companies
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1.5">{stats?.active_companies || 0}</div>
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  Last 30 days
                </div>
              </div>

              {/* Total Users */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Users
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1.5">{stats?.total_users || 0}</div>
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  All companies
                </div>
              </div>

              {/* Platform Health */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Platform Status
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1.5">{stats?.platform_health || "Unknown"}</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">
                  ● System healthy
                </div>
              </div>
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Growth Chart */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-5">Company Growth (7 Days)</h2>
                <div className="space-y-4">
                  {stats?.growth_data && stats.growth_data.length > 0 ? (
                    <div className="h-48">
                      <div className="flex items-end justify-between h-full gap-2">
                        {stats.growth_data.map((item, index) => {
                          const maxCount = Math.max(...stats.growth_data.map(d => d.count), 1);
                          const height = (item.count / maxCount) * 100;
                          const date = new Date(item.date);
                          const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });

                          return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative" style={{ height: '100%' }}>
                                <div
                                  className="absolute bottom-0 w-full bg-blue-600 dark:bg-blue-500 rounded-t-lg transition-all hover:bg-blue-700 dark:hover:bg-blue-600"
                                  style={{ height: `${height}%`, minHeight: item.count > 0 ? '8px' : '0' }}
                                  title={`${item.count} companies`}
                                >
                                  {item.count > 0 && (
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-slate-900 dark:text-slate-100">
                                      {item.count}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                {dayLabel}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                      No growth data available
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Companies */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-5">Recent Companies</h2>
                <div className="space-y-3">
                  {stats?.recent_companies && stats.recent_companies.length > 0 ? (
                    stats.recent_companies.map((company) => (
                      <div key={company.id} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                            {company.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {company.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {company.domain}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(company.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                      No companies created yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
