import { Card } from "../../components/ui/Card";
import { useEmployeeAuth } from "../../auth/EmployeeAuthContext";
import { DashboardWidgets } from "./DashboardWidgets";
import { TodayTasksSnippet } from "./TodayTasksSnippet";
import { useNavigate } from "react-router-dom";

function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good Morning",  emoji: "☀️" };
  if (h < 17) return { text: "Good Afternoon", emoji: "🌤️" };
  return          { text: "Good Evening",   emoji: "🌙" };
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month:   "long",
    day:     "numeric",
    year:    "numeric",
  });
}

const quickActions = [
  {
    label: "New Request",
    subtitle: "Raise a support ticket",
    path: "/app/service-requests",
    gradient: "from-rose-500 to-pink-600",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    border: "border-rose-100 dark:border-rose-500/20",
    textColor: "text-rose-600 dark:text-rose-400",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
  },
  {
    label: "Open Chat",
    subtitle: "Message your team",
    path: "/app/chat",
    gradient: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-100 dark:border-blue-500/20",
    textColor: "text-blue-600 dark:text-blue-400",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    label: "Today's Tasks",
    subtitle: "See what's due today",
    path: "/app/tasks/today",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-100 dark:border-emerald-500/20",
    textColor: "text-emerald-600 dark:text-emerald-400",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Documents",
    subtitle: "Browse your files",
    path: "/app/documents",
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    border: "border-violet-100 dark:border-violet-500/20",
    textColor: "text-violet-600 dark:text-violet-400",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Broadcasts",
    subtitle: "Company announcements",
    path: "/app/broadcast",
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-100 dark:border-amber-500/20",
    textColor: "text-amber-600 dark:text-amber-400",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    label: "Gmail",
    subtitle: "Check your inbox",
    path: "/app/gmail",
    gradient: "from-sky-500 to-blue-600",
    bg: "bg-sky-50 dark:bg-sky-500/10",
    border: "border-sky-100 dark:border-sky-500/20",
    textColor: "text-sky-600 dark:text-sky-400",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export function EmployeeDashboard() {
  const { user } = useEmployeeAuth();
  const navigate = useNavigate();
  const greeting = getGreeting();
  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Hero greeting banner ── */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 shadow-xl animate-[fadeSlideIn_0.5s_ease-out_both]"
        style={{ background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #818cf8 70%, #3b82f6 100%)", backgroundSize: "200% 200%" }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-8 left-1/3 w-32 h-32 rounded-full bg-blue-300/10 blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            {/* Greeting */}
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl animate-[waveHand_2.5s_ease-in-out_1]">
                {greeting.emoji}
              </span>
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-0.5">
                  {getFormattedDate()}
                </p>
                <h1 className="text-2xl font-black text-white leading-tight">
                  {greeting.text},{" "}
                  <span className="text-blue-100">{firstName}</span>!
                </h1>
              </div>
            </div>

            {/* Role badges */}
            {user?.roles && user.roles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                    {role}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick stat pill */}
          <div className="flex-shrink-0 rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm px-5 py-4 text-center">
            <p className="text-white/70 text-[10px] font-semibold uppercase tracking-widest mb-1">Today</p>
            <p className="text-white font-black text-2xl leading-none">{new Date().toLocaleDateString("en-US", { day: "numeric" })}</p>
            <p className="text-blue-200 text-[11px] font-medium mt-0.5">{new Date().toLocaleDateString("en-US", { month: "short", weekday: "short" })}</p>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, i) => (
            <button
              key={action.label}
              type="button"
              onClick={() => navigate(action.path)}
              id={`quick-action-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={`
                group flex flex-col items-center gap-2.5 rounded-2xl border p-4
                ${action.bg} ${action.border}
                hover:shadow-lg transition-all duration-250 hover:-translate-y-1
                animate-[fadeSlideIn_0.4s_ease-out_both]
                cursor-pointer text-left
              `}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`
                flex h-11 w-11 items-center justify-center rounded-xl
                bg-gradient-to-br ${action.gradient} text-white
                shadow-md group-hover:scale-110 group-hover:shadow-lg
                transition-all duration-300
              `}>
                {action.icon}
              </div>
              <div className="text-center">
                <p className={`text-xs font-bold leading-tight ${action.textColor}`}>
                  {action.label}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5 leading-tight">
                  {action.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Workspace overview (spans 2 cols) */}
        <Card
          title="Workspace Overview"
          description="Your intelligent office hub — everything in one place."
          className="lg:col-span-2"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
            </svg>
          }
          accentColor="indigo"
        >
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
            Welcome to your intelligent workspace. Use the sidebar to navigate between modules, or jump to any section using the quick actions above.
          </p>

          {/* Info tiles */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Chat",     icon: "💬", desc: "Team messaging",         path: "/app/chat" },
              { label: "Requests", icon: "🎫", desc: "Support tickets",         path: "/app/service-requests" },
              { label: "Docs",     icon: "📁", desc: "Shared documents",        path: "/app/documents" },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.path)}
                className="group flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/[0.06] p-3 bg-slate-50 dark:bg-white/[0.03] hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-200 cursor-pointer"
              >
                <span className="text-xl">{item.icon}</span>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">{item.label}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-600">{item.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Today's tasks snippet */}
        <TodayTasksSnippet />
      </div>

      {/* ── Dashboard widgets ── */}
      <DashboardWidgets />
    </div>
  );
}
