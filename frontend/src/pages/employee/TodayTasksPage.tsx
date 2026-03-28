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

interface TodayTasksState {
  tasks: TaskItem[];
  summary: TodayTasksSummary | null;
}

const initialState: TodayTasksState = {
  tasks: [],
  summary: null,
};

export function TodayTasksPage() {
  const [state, setState] = useState<TodayTasksState>(initialState);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const response = await getTodayTasks();
      const data = response.data;
      setState({
        tasks: data.tasks ?? [],
        summary: data.summary ?? null,
      });
    } catch (err) {
      console.error("Failed to load today tasks", err);
      setError(
        "Unable to load your tasks. Make sure your Google account is connected.",
      );
      setState(initialState);
    } finally {
      setLoading(false);
    }
  }

  const { tasks, summary } = state;
  const hasTasks = tasks.length > 0;

  async function handleComplete(taskId: string): Promise<void> {
    if (completingId) return;
    setCompletingId(taskId);
    try {
      await completeTask(taskId);
      await load();
    } catch (err) {
      console.error("Failed to complete task", err);
      setError("Unable to complete task. Please try again.");
    } finally {
      setCompletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <Card
        title="Today's Tasks"
        description="Tasks from your Google Tasks list scheduled for today."
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-300">
            Stay on top of what’s due today. Use the button to jump into full
            Google Calendar.
          </p>
          <a
            href="https://calendar.google.com/calendar/u/0/r"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700"
          >
            Open Calendar
          </a>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-500">Loading tasks…</p>
            </div>
          </div>
        ) : hasTasks ? (
          <div className="space-y-4">
            {summary && (
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Total
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                    {summary.total}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600">
                    Completed
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-700 dark:text-emerald-400">
                    {summary.completed}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-amber-600">
                    Pending
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-amber-700 dark:text-amber-400">
                    {summary.pending}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-2 max-h-[420px] overflow-y-auto space-y-2">
              {tasks.map((task) => {
                const isCompleted = task.status === "completed";
                const dueLabel = task.due
                  ? new Date(task.due).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "No time";

                return (
                  <div
                    key={task.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div>
                      <p
                        className={`font-medium ${
                          isCompleted
                            ? "text-slate-400 line-through"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.notes && (
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-300 line-clamp-2">
                          {task.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant={isCompleted ? "success" : "warning"}
                        size="sm"
                      >
                        {isCompleted ? "Completed" : "Pending"}
                      </Badge>
                      <p className="text-[11px] text-slate-500 dark:text-slate-300">
                        {dueLabel}
                      </p>
                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() => void handleComplete(task.id)}
                          disabled={completingId === task.id}
                          className="mt-1 inline-flex items-center rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {completingId === task.id
                            ? "Completing…"
                            : "Mark done"}
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
            description="Either you have a clear day, or your Google Tasks list is empty."
          />
        )}

        {error && (
          <p className="mt-3 text-xs text-rose-600">
            {error}
          </p>
        )}
      </Card>
    </div>
  );
}

