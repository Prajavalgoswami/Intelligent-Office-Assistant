import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentAdmin, type AdminMeResponse } from '../../api/companyAdmin.api';

interface DashboardAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

export const CompanyAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const res = await getCurrentAdmin();
        setAdmin(res.data);
      } catch (error) {
        console.error("Failed to fetch admin info", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminInfo();
  }, []);

  // Listen for theme changes from DashboardLayout
  useEffect(() => {
  const syncTheme = () => {
    const saved = localStorage.getItem('isDarkMode');
    setIsDarkMode(saved !== null ? JSON.parse(saved) : true);
  };

  // Initial sync
  syncTheme();

  // 🔥 Observe DOM class changes (theme toggle usually changes <html> or <body>)
  const observer = new MutationObserver(() => {
    syncTheme();
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  // Also listen for custom themeChange if it exists
  window.addEventListener('themeChange', syncTheme);

  return () => {
    observer.disconnect();
    window.removeEventListener('themeChange', syncTheme);
  };
}, []);


  const actions: DashboardAction[] = [
    {
      id: 'departments',
      title: 'Departments',
      description: 'Create and manage organizational departments',
      path: '/company-admin/departments',
      color: 'from-blue-500 to-blue-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: 'roles',
      title: 'Roles & Permissions',
      description: 'Define roles and manage access control',
      path: '/company-admin/roles',
      color: 'from-purple-500 to-purple-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      id: 'users',
      title: 'Team Members',
      description: 'Add and manage employee accounts',
      path: '/company-admin/users',
      color: 'from-emerald-500 to-emerald-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-white to-slate-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className={`w-12 h-12 border-4 rounded-full animate-spin ${isDarkMode ? 'border-blue-500/30 border-t-blue-500' : 'border-blue-400/30 border-t-blue-600'}`} />
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main content */}
      <div className="px-6 sm:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Intro section */}
          <div className="mb-12">
            <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Welcome back, <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>{admin?.name}</span></h2>
            <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
              Organize your teams, define roles, and manage employee access
            </p>
          </div>

          {/* Action cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => navigate(action.path)}
                className={`group relative overflow-hidden rounded-2xl border p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                  isDarkMode
                    ? 'border-white/10 hover:border-white/20 bg-slate-800/50 hover:bg-slate-800/80'
                    : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 hover:shadow-lg'
                }`}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative z-10 flex flex-col gap-4 h-full">
                  {/* Icon */}
                  <div className={`inline-flex w-fit rounded-xl bg-gradient-to-br ${action.color} p-3 text-white shadow-lg group-hover:shadow-2xl transition-all duration-300`}>
                    {action.icon}
                  </div>

                  {/* Text */}
                  <div className="space-y-2 flex-1">
                    <h3 className={`font-bold transition-colors text-lg ${isDarkMode ? 'text-white group-hover:text-blue-200' : 'text-slate-900 group-hover:text-slate-700'}`}>
                      {action.title}
                    </h3>
                    <p className={`text-sm transition-colors ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-600 group-hover:text-slate-500'}`}>
                      {action.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className={`flex items-center text-sm transition-colors pt-4 ${
                    isDarkMode
                      ? 'border-t border-white/10 text-slate-400 group-hover:text-blue-400 group-hover:border-white/20'
                      : 'border-t border-slate-300 text-slate-600 group-hover:text-blue-600 group-hover:border-slate-400'
                  }`}>
                    <span>Access</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Quick stats section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`rounded-xl border p-6 transition-colors ${
              isDarkMode
                ? 'border-white/10 bg-slate-800/50'
                : 'border-slate-300 bg-white'
            } backdrop-blur-xl`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Company ID</p>
                  <p className={`text-lg font-semibold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{admin?.company_id.slice(0, 12)}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`rounded-xl border p-6 transition-colors ${
              isDarkMode
                ? 'border-white/10 bg-slate-800/50'
                : 'border-slate-300 bg-white'
            } backdrop-blur-xl`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>User Email</p>
                  <p className={`text-lg font-semibold mt-1 truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{admin?.email}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`rounded-xl border p-6 transition-colors ${
              isDarkMode
                ? 'border-white/10 bg-slate-800/50'
                : 'border-slate-300 bg-white'
            } backdrop-blur-xl`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Admin Status</p>
                  <p className={`text-lg font-semibold mt-1 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>Active</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                  <div className={`w-3 h-3 rounded-full animate-pulse ${isDarkMode ? 'bg-emerald-500' : 'bg-emerald-600'}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};