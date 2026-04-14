import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Badge } from "../../components/ui/Badge";
import {
  getTodayTasks,
  completeTask,
  type TaskItem,
  type TodayTasksSummary,
} from "../../api/tasks.api";

interface State { tasks: TaskItem[]; summary: TodayTasksSummary | null; }
const init: State = { tasks: [], summary: null };

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const color =
    pct >= 80 ? "from-emerald-500 to-teal-500" :
    pct >= 40 ? "from-amber-500 to-orange-500" :
                "from-rose-500 to-pink-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Progress</span>
        <span className="font-black text-slate-900 dark:text-white tabular-nums">{Math.round(pct)}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 shadow-inner">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} shadow-sm transition-all duration-700 ease-out`}
          style={{ width: `${pct}%`, animation: "progressFill 1s ease-out both" }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-500">
        <span className="font-medium">{completed} completed</span>
        <span className="font-medium">{total - completed} remaining</span>
      </div>
    </div>
  );
}

function StatBubble({
  label, value, color, bg, border,
}: { label: string; value: number; color: string; bg: string; border: string }) {
  return (
    <div className={`rounded-2xl border px-4 py-3.5 ${bg} ${border} animate-[fadeSlideIn_0.35s_ease-out_both]`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500 mb-1">{label}</p>
      <p className={`text-3xl font-black tabular-nums leading-none ${color}`}>{value}</p>
    </div>
  );
}

export function TodayTasksPage() {
  const [state, setState] = useState<State>(init);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await getTodayTasks();
      setState({ tasks: r.data.tasks ?? [], summary: r.data.summary ?? null });
    } catch {
      setError("Unable to load your tasks. Make sure your Google account is connected.");
      setState(init);
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete(taskId: string) {
    if (completingId) return;
    setCompletingId(taskId);
    try {
      await completeTask(taskId);
      setJustCompleted(taskId);
      setTimeout(async () => { await load(); setJustCompleted(null); }, 650);
    } catch {
      setError("Unable to complete task. Please try again.");
    } finally {
      setCompletingId(null);
    }
  }

  const { tasks, summary } = state;
  const hasTasks = tasks.length > 0;

  const taskIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <Card
        title="Today's Tasks"
        description="Tasks from your Google Tasks list scheduled for today."
        icon={taskIcon}
        accentColor="blue"
        headerAction={
          <a
            href="https://calendar.google.com/calendar/u/0/r"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Calendar
          </a>
        }
      >
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 rounded-2xl border border-slate-100 dark:border-white/[0.05] p-4">
                <div className="w-5 h-5 rounded-md skeleton-shimmer flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-2/3 rounded-lg skeleton-shimmer" />
                  <div className="h-2.5 w-1/3 rounded-lg skeleton-shimmer" />
                </div>
                <div className="h-6 w-14 rounded-full skeleton-shimmer" />
              </div>
            ))}
          </div>
        ) : hasTasks ? (
          <div className="space-y-5">
            {/* Progress */}
            {summary && <ProgressBar completed={summary.completed} total={summary.total} />}

            {/* Stat bubbles */}
            {summary && (
              <div className="grid grid-cols-3 gap-3">
                <StatBubble
                  label="Total" value={summary.total}
                  color="text-slate-900 dark:text-white"
                  bg="bg-slate-50 dark:bg-white/[0.03]"
                  border="border-slate-200 dark:border-white/[0.06]"
                />
                <StatBubble
                  label="Done" value={summary.completed}
                  color="text-emerald-700 dark:text-emerald-400"
                  bg="bg-emerald-50 dark:bg-emerald-500/10"
                  border="border-emerald-200 dark:border-emerald-500/20"
                />
                <StatBubble
                  label="Pending" value={summary.pending}
                  color="text-amber-700 dark:text-amber-400"
                  bg="bg-amber-50 dark:bg-amber-500/10"
                  border="border-amber-200 dark:border-amber-500/20"
                />
              </div>
            )}

            {/* Task list */}
            <div className="space-y-2 max-h-[480px] overflow-y-auto custom-scrollbar pr-1">
              {tasks.map((task, i) => {
                const isCompleted = task.status === "completed";
                const isJustDone = justCompleted === task.id;
                const isCompleting = completingId === task.id;
                const dueLabel = task.due
                  ? new Date(task.due).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "No time set";

                return (
                  <div
                    key={task.id}
                    className={`
                      group flex items-start justify-between gap-4 rounded-2xl border px-4 py-3.5
                      transition-all duration-300 animate-[fadeSlideIn_0.3s_ease-out_both]
                      ${isJustDone
                        ? "scale-[0.97] opacity-0 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-500/10"
                        : isCompleted
                          ? "border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.02]"
                          : "border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-md dark:hover:shadow-indigo-500/5 hover:-translate-y-0.5"
                      }
                    `}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {/* Left: checkbox + text */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Checkbox */}
                      <div className={`
                        mt-0.5 flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-md border-2
                        transition-all duration-300
                        ${isCompleted || isJustDone
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-slate-300 dark:border-slate-600 group-hover:border-indigo-400 dark:group-hover:border-indigo-500"
                        }
                      `}>
                        {(isCompleted || isJustDone) && (
                          <svg className="h-3 w-3 text-white animate-[checkPop_0.3s_ease-out]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Title + notes */}
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold leading-snug transition-all duration-300 ${
                          isCompleted
                            ? "line-through text-slate-400 dark:text-slate-600"
                            : "text-slate-900 dark:text-slate-100"
                        }`}>
                          {task.title}
                        </p>
                        {task.notes && (
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-500 line-clamp-1 leading-relaxed">
                            {task.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: badge + time + action */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <Badge variant={isCompleted ? "success" : "warning"} size="sm">
                        {isCompleted ? "Done" : "Pending"}
                      </Badge>
                      <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium tabular-nums">
                        {dueLabel}
                      </p>
                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() => void handleComplete(task.id)}
                          disabled={!!completingId}
                          id={`complete-task-${task.id}`}
                          className="
                            mt-0.5 inline-flex items-center gap-1.5 rounded-xl
                            bg-gradient-to-r from-emerald-600 to-teal-600
                            px-2.5 py-1.5 text-[10px] font-bold text-white shadow-sm
                            hover:shadow-emerald-500/30 hover:-translate-y-0.5
                            transition-all duration-200
                            disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                          "
                        >
                          {isCompleting ? (
                            <>
                              <span className="h-2.5 w-2.5 rounded-full border-2 border-white/50 border-t-white animate-spin" />
                              <span>Completing…</span>
                            </>
                          ) : (
                            <>
                              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Mark done</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No tasks for today"
            description="Either you have a clear schedule or your Google Tasks list is empty."
            action={
              <a
                href="https://tasks.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                Open Google Tasks →
              </a>
            }
          />
        )}

        {error && !loading && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-4 py-3">
            <svg className="h-4 w-4 flex-shrink-0 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
