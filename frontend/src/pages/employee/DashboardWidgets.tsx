import { useEffect, useState, useRef } from "react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { getServiceRequests, type ServiceRequest } from "../../api/serviceRequest.api";
import { getMyBroadcasts, type BroadcastMessage } from "../../api/broadcast.api";
import { getGmailStatus, type GmailStatusResponse } from "../../api/gmail.api";
import { useNavigate } from "react-router-dom";

interface DashboardState {
  openRequestsCount: number;
  latestBroadcasts: BroadcastMessage[];
  gmailConnected: boolean;
}

const initialState: DashboardState = {
  openRequestsCount: 0,
  latestBroadcasts: [],
  gmailConnected: false,
};

function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, duration]);

  return <>{display}</>;
}

function SkeletonRow() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-8 w-16 rounded-xl skeleton-shimmer" />
      <div className="h-3 w-28 rounded-full skeleton-shimmer" />
      <div className="h-3 w-20 rounded-full skeleton-shimmer" />
    </div>
  );
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (isNaN(diff)) return dateStr;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function DashboardWidgets() {
  const navigate = useNavigate();
  const [state, setState] = useState<DashboardState>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [srRes, bcRes, gmailRes] = await Promise.all([
          getServiceRequests(),
          getMyBroadcasts(),
          getGmailStatus(),
        ]);
        if (!mounted) return;

        const srList: ServiceRequest[] = srRes.data ?? [];
        const bcList: BroadcastMessage[] = bcRes.data ?? [];
        const gmailStatus: GmailStatusResponse | undefined = gmailRes.data;

        setState({
          openRequestsCount: srList.filter((r) => String(r.status).toLowerCase() !== "resolved").length,
          latestBroadcasts: [...bcList]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 4),
          gmailConnected: Boolean(gmailStatus?.email),
        });
      } catch {
        if (mounted) {
          setError("Unable to load dashboard insights at the moment.");
          setState(initialState);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void fetchData();
    const interval = window.setInterval(() => void fetchData(), 20_000);
    return () => { mounted = false; window.clearInterval(interval); };
  }, []);

  // -- icons --
  const ticketIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
  const broadcastIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );
  const gmailIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  return (
    <div className="grid gap-5 md:grid-cols-3">

      {/* ── Service Requests ── */}
      <Card
        title="Open Requests"
        description="Support tickets needing attention"
        icon={ticketIcon}
        accentColor="rose"
        headerAction={
          <button
            type="button"
            onClick={() => navigate("/app/service-requests")}
            className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View all →
          </button>
        }
      >
        {loading ? (
          <SkeletonRow />
        ) : (
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-slate-900 dark:text-white leading-none tabular-nums">
              <AnimatedCounter value={state.openRequestsCount} />
            </span>
            <div className="pb-1 space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">open</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                {state.openRequestsCount === 1 ? "ticket" : "tickets"}
              </p>
            </div>
          </div>
        )}

        {/* Status row */}
        {!loading && (
          <div className="mt-4 flex items-center gap-2">
            <Badge
              variant={state.openRequestsCount > 0 ? "warning" : "success"}
              size="sm"
              pulse={state.openRequestsCount > 0}
            >
              {state.openRequestsCount > 0 ? "Action needed" : "All resolved"}
            </Badge>
          </div>
        )}

        {error && (
          <p className="mt-3 text-[11px] text-rose-500 dark:text-rose-400">{error}</p>
        )}
      </Card>

      {/* ── Latest Broadcasts ── */}
      <Card
        title="Latest Broadcasts"
        description="Recent company announcements"
        icon={broadcastIcon}
        accentColor="violet"
        headerAction={
          <button
            type="button"
            onClick={() => navigate("/app/broadcast")}
            className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View all →
          </button>
        }
      >
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="w-1.5 h-1.5 mt-1.5 rounded-full skeleton-shimmer flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-3/4 rounded skeleton-shimmer" />
                  <div className="h-2.5 w-full rounded skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : state.latestBroadcasts.length === 0 ? (
          <EmptyState
            title="No broadcasts yet"
            description="Announcements will appear here."
          />
        ) : (
          <ul className="space-y-2.5">
            {state.latestBroadcasts.map((bc, i) => (
              <li
                key={bc._id}
                className="group flex gap-3 rounded-xl border border-slate-100 dark:border-white/[0.05] p-2.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:border-slate-200 dark:hover:border-white/[0.09] transition-all duration-200 animate-[fadeSlideIn_0.3s_ease-out_both]"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Violet dot */}
                <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-1 leading-tight">
                      {bc.title}
                    </p>
                    <span className="flex-shrink-0 text-[9px] text-slate-400 dark:text-slate-600 font-medium mt-0.5">
                      {relativeTime(bc.created_at)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 leading-relaxed">
                    {bc.content}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p className="mt-3 text-[11px] text-rose-500 dark:text-rose-400">{error}</p>
        )}
      </Card>

      {/* ── Gmail Status ── */}
      <Card
        title="Gmail Integration"
        description="Work email connection status"
        icon={gmailIcon}
        accentColor="emerald"
      >
        {loading ? (
          <SkeletonRow />
        ) : (
          <div className="space-y-4">
            {/* Live indicator row */}
            <div className="flex items-center gap-3">
              <span className="relative flex h-4 w-4 items-center justify-center flex-shrink-0">
                {state.gmailConnected && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                )}
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  state.gmailConnected ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                }`} />
              </span>
              <Badge
                variant={state.gmailConnected ? "success" : "muted"}
                size="md"
                pulse={state.gmailConnected}
              >
                {state.gmailConnected ? "Connected" : "Not connected"}
              </Badge>
            </div>

            {/* Status description */}
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {state.gmailConnected
                ? "Your Gmail is linked. Smart email workflows are active."
                : "Connect Gmail via the sidebar to enable smart email workflows and notifications."}
            </p>

            {/* CTA if not connected */}
            {!state.gmailConnected && (
              <button
                type="button"
                onClick={() => navigate("/app/gmail")}
                className="
                  inline-flex items-center gap-1.5 rounded-xl
                  border border-emerald-200 dark:border-emerald-700/40
                  bg-emerald-50 dark:bg-emerald-500/10
                  text-emerald-700 dark:text-emerald-400
                  px-3 py-1.5 text-xs font-semibold
                  hover:bg-emerald-100 dark:hover:bg-emerald-500/20
                  transition-all duration-200
                "
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Connect Gmail
              </button>
            )}
          </div>
        )}

        {error && !state.gmailConnected && (
          <p className="mt-3 text-[11px] text-rose-500 dark:text-rose-400">{error}</p>
        )}
      </Card>
    </div>
  );
}