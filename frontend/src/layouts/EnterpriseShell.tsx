import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate, NavLink, Link } from "react-router-dom";

export interface SidebarLink {
  id: string;
  label: string;
  to: string;
  exact?: boolean;
  icon?: ReactNode;
  badgeCount?: number;
}

export interface EnterpriseShellProps {
  pageTitle: string;
  sidebarLinks: SidebarLink[];
  children: ReactNode;
  onLogout?: () => void;
  userDisplayName?: string;
  userSubtitle?: string;
  /** When set, shows a Profile control in the top bar (next to the page title). */
  profileHref?: string;
}

export function EnterpriseShell({
  pageTitle,
  sidebarLinks,
  children,
  onLogout,
  userDisplayName = "User",
  userSubtitle = "Employee",
  profileHref,
}: EnterpriseShellProps) {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("employee_isDarkMode");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    localStorage.setItem("employee_isDarkMode", JSON.stringify(isDarkMode));
    if (isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("access_token");
      navigate("/employee-login", { replace: true });
    }
  };

  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-white via-slate-50 to-white"
      } ${isDarkMode ? "text-white" : "text-slate-900"}`}
    >
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 transition-colors duration-300 shadow-2xl ${
          isDarkMode
            ? "bg-slate-900 border-r-2 border-slate-700"
            : "bg-white border-r-2 border-slate-300"
        } backdrop-blur-xl transform transition-transform duration-300 ${
          showMobileMenu ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
              <span className="text-white font-bold text-lg">IO</span>
            </div>
            <div>
              <h1
                className="text-xl font-bold tracking-tight"
                style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif" }}
              >
                Workspace
              </h1>
              <p
                className={`text-sm font-semibold ${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Intelligent Office Assistant
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto">
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.id}
                to={link.to}
                end={link.exact ?? false}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-3 px-5 py-3 rounded-xl transition-all group font-semibold ${
                    isDarkMode
                      ? isActive
                        ? "bg-slate-800 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      : isActive
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <span className="flex items-center gap-4 min-w-0">
                  {link.icon && (
                    <span
                      className={`w-5 h-5 shrink-0 ${
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {link.icon}
                    </span>
                  )}
                  <span className="truncate">{link.label}</span>
                </span>
                {typeof link.badgeCount === "number" && link.badgeCount > 0 && (
                  <span className="shrink-0 min-w-[1.5rem] inline-flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                    {link.badgeCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-5 py-3 rounded-xl transition-all font-semibold border-2 ${
              isDarkMode
                ? "text-slate-300 hover:bg-red-500/20 hover:text-red-400 border-transparent hover:border-red-500/30"
                : "text-slate-700 hover:bg-red-100 hover:text-red-600 border-transparent hover:border-red-300"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col lg:ml-80 min-w-0">
        <header
          className={`sticky top-0 z-40 backdrop-blur-xl transition-colors duration-300 ${
            isDarkMode
              ? "bg-slate-900/80 border-b border-white/10"
              : "bg-white/80 border-b border-slate-200"
          }`}
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className={`lg:hidden p-2 rounded-lg ${
                  isDarkMode ? "hover:bg-white/10" : "hover:bg-slate-100"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h1 className="text-xl font-bold tracking-tight truncate">
                {pageTitle}
              </h1>
              {profileHref && (
                <Link
                  to={profileHref}
                  className={`hidden sm:inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                    isDarkMode
                      ? "bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  }`}
                >
                  <svg
                    className="w-4 h-4 shrink-0 opacity-80"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Profile
                </Link>
              )}
            </div>

            <div
              className={`flex items-center gap-3 ${
                isDarkMode ? "border-l border-white/10 pl-4" : "border-l border-slate-200 pl-4"
              }`}
            >
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative inline-flex items-center justify-center rounded-full px-3 py-2 text-xl transition-all ${
                isDarkMode
                  ? "bg-gradient-to-br from-slate-900/60 to-slate-800/60 ring-1 ring-white/10 hover:ring-white/20"
                  : "bg-gradient-to-br from-white to-slate-50 ring-1 ring-slate-200 hover:ring-slate-300"
              } shadow-sm`}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span
                className={`drop-shadow ${
                  isDarkMode ? "text-yellow-200" : "text-slate-800"
                }`}
              >
                {isDarkMode ? "🌙" : "☀️"}
              </span>
            </button>
              {profileHref ? (
                <Link
                  to={profileHref}
                  className={`hidden sm:flex items-center gap-3 rounded-lg ${
                    isDarkMode
                      ? "border-l border-white/10 pl-3 hover:opacity-90"
                      : "border-l border-slate-200 pl-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-semibold text-white">
                    {userDisplayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <p className={`font-medium truncate max-w-[8rem] ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                      {userDisplayName}
                    </p>
                    <p className={`text-xs truncate max-w-[8rem] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                      {userSubtitle}
                    </p>
                  </div>
                </Link>
              ) : (
                <div
                  className={`hidden sm:flex items-center gap-3 ${
                    isDarkMode ? "border-l border-white/10 pl-3" : "border-l border-slate-200 pl-3"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-semibold text-white">
                    {userDisplayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <p className={`font-medium truncate max-w-[8rem] ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                      {userDisplayName}
                    </p>
                    <p className={`text-xs truncate max-w-[8rem] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                      {userSubtitle}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>

      {showMobileMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
          onKeyDown={(e) => e.key === "Escape" && setShowMobileMenu(false)}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}
    </div>
  );
}
