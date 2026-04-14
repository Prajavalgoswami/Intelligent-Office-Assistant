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
  profileHref?: string;
}

// Sun icon for light mode
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <circle cx="12" cy="12" r="5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

// Moon icon for dark mode
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4.5 h-4.5 w-[18px] h-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Color palette for each sidebar link (cycles through)
const linkColors = [
  "from-indigo-500 to-blue-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-violet-500 to-purple-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-cyan-500 to-sky-500",
  "from-pink-500 to-rose-500",
  "from-teal-500 to-emerald-500",
];

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    localStorage.setItem("employee_isDarkMode", JSON.stringify(isDarkMode));
    if (isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pageTitle]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("access_token");
      navigate("/employee-login", { replace: true });
    }
  };

  const sidebarWidth = isCollapsed ? "lg:w-20" : "lg:w-72";
  const contentMargin = isCollapsed ? "lg:ml-20" : "lg:ml-72";

  const initials = userDisplayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-[#0b0f1a]" : "bg-slate-50"
      }`}
    >
      {/* ── Sidebar ─────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          w-72 ${sidebarWidth}
          transition-all duration-300 ease-in-out
          ${isDarkMode
            ? "bg-[#0f172a] border-r border-white/[0.06]"
            : "bg-white border-r border-slate-200"
          }
          shadow-[2px_0_24px_rgba(0,0,0,0.08)]
          transform
          ${showMobileMenu ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Brand header */}
        <div className={`flex items-center gap-3 px-5 ${isCollapsed ? "lg:justify-center lg:px-3" : ""} py-5 mb-2`}>
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-sm tracking-tight">IO</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0f172a]" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className={`text-sm font-bold tracking-tight truncate ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                Workspace
              </p>
              <p className={`text-[10px] font-medium truncate ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Intelligent Office
              </p>
            </div>
          )}

          {/* Collapse toggle (desktop only) */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`ml-auto hidden lg:flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
              isDarkMode
                ? "text-slate-400 hover:text-white hover:bg-white/10"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            } ${isCollapsed ? "rotate-180" : ""}`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className={`mx-4 mb-3 h-px ${isDarkMode ? "bg-white/[0.06]" : "bg-slate-100"}`} />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 py-1 custom-scrollbar">
          {sidebarLinks.map((link, i) => {
            const colorClass = linkColors[i % linkColors.length];
            return (
              <NavLink
                key={link.id}
                to={link.to}
                end={link.exact ?? false}
                title={isCollapsed ? link.label : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 font-medium text-sm
                   ${isCollapsed ? "lg:justify-center lg:px-0 lg:py-2.5" : ""}
                   ${isActive
                    ? isDarkMode
                      ? "bg-indigo-500/10 text-indigo-300 sidebar-active-glow"
                      : "bg-indigo-50 text-indigo-700 sidebar-active-glow"
                    : isDarkMode
                      ? "text-slate-400 hover:text-slate-100 hover:bg-white/[0.06]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                   }`
                }
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {({ isActive }) => (
                  <>
                    {/* Icon bg bubble */}
                    {link.icon && (
                      <span
                        className={`
                          flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
                          ${isActive
                            ? `bg-gradient-to-br ${colorClass} text-white shadow-md`
                            : isDarkMode
                              ? "bg-white/[0.06] text-slate-400 group-hover:bg-white/10 group-hover:text-slate-200"
                              : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                          }
                        `}
                      >
                        <span className="w-4 h-4 block">{link.icon}</span>
                      </span>
                    )}

                    {/* Label */}
                    {!isCollapsed && (
                      <span className="flex-1 truncate">{link.label}</span>
                    )}

                    {/* Badge */}
                    {!isCollapsed && typeof link.badgeCount === "number" && link.badgeCount > 0 && (
                      <span
                        className="ml-auto flex-shrink-0 min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center rounded-full
                          bg-indigo-500 text-white text-[10px] font-bold animate-[badgePop_0.4s_ease-out]"
                      >
                        {link.badgeCount > 99 ? "99+" : link.badgeCount}
                      </span>
                    )}

                    {/* Collapsed badge dot */}
                    {isCollapsed && typeof link.badgeCount === "number" && link.badgeCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
                    )}

                    {/* Active indicator bar */}
                    {isActive && !isCollapsed && (
                      <span className="absolute right-2 w-1 h-4 rounded-full bg-gradient-to-b from-indigo-400 to-indigo-600" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Divider */}
        <div className={`mx-4 mt-2 mb-3 h-px ${isDarkMode ? "bg-white/[0.06]" : "bg-slate-100"}`} />

        {/* User profile block at bottom */}
        {profileHref ? (
          <Link
            to={profileHref}
            className={`
              mx-3 mb-2 flex items-center gap-3 rounded-xl px-3 py-3 transition-all
              ${isCollapsed ? "lg:justify-center lg:px-0" : ""}
              ${isDarkMode
                ? "hover:bg-white/[0.06] text-slate-300 hover:text-white"
                : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
              }
            `}
          >
            <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
              {initials}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold truncate ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
                  {userDisplayName}
                </p>
                <p className={`text-[10px] truncate ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
                  {userSubtitle}
                </p>
              </div>
            )}
          </Link>
        ) : (
          <div
            className={`
              mx-3 mb-2 flex items-center gap-3 rounded-xl px-3 py-3
              ${isCollapsed ? "lg:justify-center lg:px-0" : ""}
            `}
          >
            <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
              {initials}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold truncate ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
                  {userDisplayName}
                </p>
                <p className={`text-[10px] truncate ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
                  {userSubtitle}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Logout button */}
        <div className="px-3 pb-4">
          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : undefined}
            className={`
              w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 font-medium text-sm
              ${isCollapsed ? "lg:justify-center lg:px-0" : ""}
              ${isDarkMode
                ? "text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
                : "text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200"
              }
            `}
          >
            <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
              isDarkMode ? "bg-white/[0.04] text-slate-500 group-hover:text-rose-400" : "bg-slate-100 text-slate-400"
            }`}>
              <LogoutIcon />
            </span>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${contentMargin}`}>

        {/* Top header */}
        <header
          className={`sticky top-0 z-40 transition-all duration-300 ${
            isDarkMode
              ? "bg-[#0b0f1a]/80 border-b border-white/[0.06] backdrop-blur-xl"
              : "bg-white/80 border-b border-slate-200/80 backdrop-blur-xl"
          } shadow-sm`}
        >
          <div className="px-5 py-3.5 flex items-center justify-between gap-4">
            {/* Left: hamburger (mobile) + page title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className={`lg:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                  isDarkMode
                    ? "text-slate-400 hover:text-white hover:bg-white/10"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
                aria-label="Toggle menu"
              >
                {showMobileMenu ? <CloseIcon /> : <MenuIcon />}
              </button>

              {/* Breadcrumb-style title */}
              <div className="flex items-center gap-2 min-w-0">
                <div className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg ${
                  isDarkMode ? "bg-indigo-500/10" : "bg-indigo-50"
                }`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`w-4 h-4 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <h1 className={`text-base font-bold tracking-tight truncate ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  {pageTitle}
                </h1>
              </div>
            </div>

            {/* Right: Theme toggle + user info */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Theme toggle */}
              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`
                  relative flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium
                  transition-all duration-300
                  ${isDarkMode
                    ? "bg-white/[0.07] text-yellow-300 hover:bg-white/10 border border-white/10"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }
                `}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                <span className="transition-transform duration-300">
                  {isDarkMode ? <MoonIcon /> : <SunIcon />}
                </span>
                <span className="hidden sm:inline">
                  {isDarkMode ? "Dark" : "Light"}
                </span>
              </button>

              {/* Divider */}
              <div className={`w-px h-6 ${isDarkMode ? "bg-white/10" : "bg-slate-200"}`} />

              {/* User chip */}
              {profileHref ? (
                <Link
                  to={profileHref}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-1.5 transition-all ${
                    isDarkMode
                      ? "hover:bg-white/[0.07] border border-transparent hover:border-white/10"
                      : "hover:bg-slate-100 border border-transparent hover:border-slate-200"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                    {initials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className={`text-xs font-semibold leading-tight truncate max-w-[7rem] ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
                      {userDisplayName}
                    </p>
                    <p className={`text-[10px] leading-tight truncate max-w-[7rem] ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
                      {userSubtitle}
                    </p>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`w-3 h-3 hidden sm:block ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <div className="flex items-center gap-2.5 px-3 py-1.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-[11px] font-bold text-white">
                    {initials}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-xs font-semibold leading-tight ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
                      {userDisplayName}
                    </p>
                    <p className={`text-[10px] leading-tight ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>
                      {userSubtitle}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          className={`flex-1 p-5 lg:p-7 overflow-y-auto page-enter ${
            isDarkMode ? "text-slate-100" : "text-slate-900"
          }`}
        >
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-[fadeIn_0.2s_ease-out]"
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
