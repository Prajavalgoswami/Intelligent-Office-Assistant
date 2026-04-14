import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { getTodayTasks, type TodayTasksSummary } from "../../api/tasks.api";
import { useNavigate } from "react-router-dom";

function ProgressRing({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const r = 34;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  const trackColor =
    pct >= 80 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="relative flex items-center justify-center flex-shrink-0">
      <svg width="84" height="84" className="-rotate-90">
        {/* Track */}
        <circle
          cx="42" cy="42" r={r}
          fill="none" strokeWidth="6"
          className="stroke-slate-200 dark:stroke-slate-700/60"
        />
        {/* Progress */}
        <circle
          cx="42" cy="42" r={r}
          fill="none" strokeWidth="6"
          strokeLinecap="round"
          style={{
            stroke: trackColor,
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 1s ease-out, stroke 0.5s ease",
            animation: "ringFill 1.2s ease-out both",
            filter: `drop-shadow(0 0 4px ${trackColor}55)`,
          }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute flex flex-col items-center leading-none">
        <span className="text-base font-black text-slate-900 dark:text-white">
          {Math.round(pct)}%
        </span>
        <span className="text-[8px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
          Done
        </span>
      </div>
    </div>
  );
}

export function TodayTasksSnippet() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<TodayTasksSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getTodayTasks();
      setSummary(res.data.summary ?? null);
    } catch {
      setError("Connect Google to see tasks here.");
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  const taskIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );

  return (
    <Card
      title="Today's Tasks"
      description="Quick progress snapshot"
      icon={taskIcon}
      accentColor="emerald"
      headerAction={
        <button
          type="button"
          onClick={() => navigate("/app/tasks/today")}
          className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap"
        >
          View all →
        </button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-[3px] border-slate-200 dark:border-slate-700" />
              <div className="absolute inset-0 rounded-full border-[3px] border-t-indigo-500 animate-spin" />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Loading tasks…</p>
          </div>
        </div>
      ) : summary ? (
        <div className="space-y-4">
          {/* Ring + stats */}
          <div className="flex items-center gap-5">
            <ProgressRing completed={summary.completed} total={summary.total} />
            <div className="space-y-3 flex-1">
              {/* Pending */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Pending</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white leading-none tabular-nums">
                  {summary.pending}
                </p>
              </div>
              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="success" size="sm">{summary.completed} done</Badge>
                <Badge variant="muted" size="sm">{summary.total} total</Badge>
              </div>
            </div>
          </div>

          {/* Mini progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000 ease-out"
              style={{
                width: summary.total > 0 ? `${(summary.completed / summary.total) * 100}%` : "0%",
              }}
            />
          </div>
        </div>
      ) : (
        <div className="py-4 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mb-3">
            {error ?? "No tasks for today or your Google Tasks list is empty."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/app/gmail")}
            className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Connect Google →
          </button>
        </div>
      )}
    </Card>
  );
}
