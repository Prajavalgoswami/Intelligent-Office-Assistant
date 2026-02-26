import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  pageTitle = 'Dashboard',
}) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const htmlElement = document.documentElement;
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem('company_admin_token');
    navigate('/company-admin/login');
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-white via-slate-50 to-white'
    } ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      {/* Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 transition-colors duration-300 shadow-2xl ${
        isDarkMode
          ? 'bg-slate-900 border-r-2 border-slate-700'
          : 'bg-white border-r-2 border-slate-300'
      } backdrop-blur-xl transform transition-transform duration-300 ${
        showMobileMenu ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full p-8">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-16">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
              <span className="text-white font-bold text-lg">IOA</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif", fontWeight: '700' }}>Admin</h1>
              <p className={`text-base font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif" }}>Control Panel</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-4">
            <a
              href="/company-admin"
              className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all group font-semibold ${
                isDarkMode
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
              style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif", fontSize: '16px', fontWeight: '600' }}
            >
              <svg className={`w-6 h-6 flex-shrink-0 transition-colors ${isDarkMode ? 'group-hover:text-blue-400' : 'group-hover:text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 16l-7-4m0 0l-2-3m2 3v10a1 1 0 001 1h12a1 1 0 001-1v-10m-9 3h9" />
              </svg>
              <span>Dashboard</span>
            </a>

            <a
              href="/company-admin/departments"
              className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all group font-semibold ${
                isDarkMode
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
              style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif", fontSize: '16px', fontWeight: '600' }}
            >
              <svg className={`w-6 h-6 flex-shrink-0 transition-colors ${isDarkMode ? 'group-hover:text-purple-400' : 'group-hover:text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Departments</span>
            </a>

            <a
              href="/company-admin/roles"
              className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all group font-semibold ${
                isDarkMode
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
              style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif", fontSize: '16px', fontWeight: '600' }}
            >
              <svg className={`w-6 h-6 flex-shrink-0 transition-colors ${isDarkMode ? 'group-hover:text-emerald-400' : 'group-hover:text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Roles</span>
            </a>

            <a
              href="/company-admin/users"
              className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all group font-semibold ${
                isDarkMode
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
              style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif", fontSize: '16px', fontWeight: '600' }}
            >
              <svg className={`w-6 h-6 flex-shrink-0 transition-colors ${isDarkMode ? 'group-hover:text-blue-400' : 'group-hover:text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Team</span>
            </a>
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-semibold border-2 ${
              isDarkMode
                ? 'text-slate-300 hover:bg-red-500/20 hover:text-red-400 border-transparent hover:border-red-500/30'
                : 'text-slate-700 hover:bg-red-100 hover:text-red-600 border-transparent hover:border-red-300'
            }`}
            style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif", fontSize: '16px', fontWeight: '600' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile menu button and Header */}
      <div className="flex-1 flex flex-col lg:ml-80">
        {/* Top bar */}
        <div className={`sticky top-0 z-40 backdrop-blur-xl transition-colors duration-300 ${
          isDarkMode
            ? 'bg-slate-900/80 border-b border-white/10'
            : 'bg-white/80 border-b border-slate-200'
        }`}>
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className={`lg:hidden p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
              </div>
            </div>

            {/* Theme toggle and user menu */}
            <div className={`flex items-center gap-3 pl-4 ${isDarkMode ? 'border-l border-white/10' : 'border-l border-slate-200'}`}>
              {/* Theme toggle */}
              <button
                onClick={() => {
                  setIsDarkMode(!isDarkMode);
                  // Dispatch custom event for other components to listen
                  window.dispatchEvent(new Event('themeChange'));
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-white/10'
                    : 'hover:bg-slate-100'
                }`}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <>
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="hidden sm:inline text-sm font-medium">Dark</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                    <span className="hidden sm:inline text-sm font-medium">Light</span>
                  </>
                )}
              </button>

              {/* User menu */}
              <div className={`hidden sm:flex items-center gap-3 pl-3 ${isDarkMode ? 'border-l border-white/10' : 'border-l border-slate-200'}`}>
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-semibold text-white">
                  A
                </div>
                <div className="text-sm">
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Admin</p>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Company Admin</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className={`flex-1 p-6 lg:p-8 transition-colors duration-300`}>
          {children}
        </main>
      </div>

      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
