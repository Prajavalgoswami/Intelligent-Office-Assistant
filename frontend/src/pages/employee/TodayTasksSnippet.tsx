import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { getTodayTasks, type TodayTasksSummary } from "../../api/tasks.api";

interface SnippetState {
  summary: TodayTasksSummary | null;
}

const initialState: SnippetState = {
  summary: null,
};

export function TodayTasksSnippet() {
  const [state, setState] = useState<SnippetState>(initialState);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const response = await getTodayTasks();
      setState({
        summary: response.data.summary ?? null,
      });
    } catch {
      setError(
        "Unable to load today's tasks. Connect Google to see your tasks here.",
      );
      setState(initialState);
    } finally {
      setLoading(false);
    }
  }

  const summary = state.summary;

  return (
    <Card title="Today" description="Quick snapshot of your tasks.">
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="flex flex-col items-center gap-2">
            <div className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-500 dark:text-slate-300">
              Loading tasks…
            </p>
          </div>
        </div>
      ) : summary ? (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-slate-900 dark:text-white">
              {summary.pending}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-300">
              pending {summary.pending === 1 ? "task" : "tasks"} today
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
            <Badge variant="success" size="sm">
              {summary.completed} done
            </Badge>
            <Badge variant="secondary" size="sm">
              {summary.total} total
            </Badge>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-300">
          No tasks for today, or your Google Tasks list is empty.
        </p>
      )}

      {error && (
        <p className="mt-3 text-xs text-rose-600">
          {error}
        </p>
      )}
    </Card>
  );
}

