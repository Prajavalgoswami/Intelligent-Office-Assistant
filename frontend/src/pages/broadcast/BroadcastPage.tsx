import { useEffect, useState, type FormEvent } from "react";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  createBroadcast,
  getMyBroadcasts,
  type BroadcastMessage,
  type BroadcastTargetType,
  type CreateBroadcastPayload,
} from "../../api/broadcast.api";
import { useEmployeeAuth } from "../../auth/EmployeeAuthContext";
import { useNotifications } from "../../context/NotificationContext";

interface CreateBroadcastFormState {
  title: string;
  content: string;
  target_type: BroadcastTargetType;
  group_id: string;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return dateStr;
  const diff = now - then;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function isNew24h(dateStr: string): boolean {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  return !isNaN(then) && now - then < 24 * 60 * 60 * 1000;
}

export function BroadcastPage() {

  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createState, setCreateState] = useState<CreateBroadcastFormState>({
    title: "",
    content: "",
    target_type: "all",
    group_id: "",
  });
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { user, hasRoleLike } = useEmployeeAuth();
  const { markBroadcastsSeen } = useNotifications();

  const isEmployee = user?.type === "employee";

  // Employees can create broadcasts only if they are Managers.
  // Company Admins use a separate frontend area.
  const canCreateBroadcast =
    isEmployee && hasRoleLike("Manager");

  useEffect(() => {
    void fetchBroadcasts();
    markBroadcastsSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markBroadcastsSeen]);

  async function fetchBroadcasts(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyBroadcasts();
      setBroadcasts(response.data ?? []);
    } catch (err) {
      console.error("Failed to load broadcasts", err);
      setError("Unable to load broadcasts. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setCreateError(null);

    const title = createState.title.trim();
    const content = createState.content.trim();
    const isGroupTarget = createState.target_type === "group";
    const groupId = createState.group_id.trim();

    if (!title || !content) {
      setCreateError("Title and content are required.");
      return;
    }

    if (isGroupTarget && !groupId) {
      setCreateError("Group ID is required when targeting a group.");
      return;
    }

    const payload: CreateBroadcastPayload = {
      title,
      content,
      target_type: createState.target_type,
      ...(isGroupTarget ? { target_id: groupId } : {}),
    };

    setCreateSubmitting(true);
    try {
      await createBroadcast(payload);
      setIsCreateOpen(false);
      setCreateState({
        title: "",
        content: "",
        target_type: "all",
        group_id: "",
      });
      await fetchBroadcasts();
    } catch (err) {
      console.error("Failed to create broadcast", err);
      setCreateError(
        "Unable to create broadcast. Please check your details and try again.",
      );
    } finally {
      setCreateSubmitting(false);
    }
  }

  const sorted = [...broadcasts].sort((a, b) => {
    const aT = new Date(a.created_at).getTime();
    const bT = new Date(b.created_at).getTime();
    if (isNaN(aT) || isNaN(bT)) return 0;
    return bT - aT;
  });

  const inputClasses =
    "block w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/80 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200";

  return (
    <div className="space-y-4">
      <Card
        title="Broadcasts"
        description="Important announcements sent to you and your groups."
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        }
        accentColor="violet"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Company announcements and group broadcasts in chronological order.
          </p>
          {canCreateBroadcast && (
            <button
              type="button"
              onClick={() => {
                if (!createSubmitting) {
                  setIsCreateOpen(true);
                  setCreateError(null);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-1.5 text-xs font-medium text-white shadow-md hover:shadow-violet-500/20 hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Broadcast
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="h-5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{error}</p>
            <button
              type="button"
              onClick={() => void fetchBroadcasts()}
              className="inline-flex items-center rounded-xl bg-slate-900 dark:bg-slate-700 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : sorted.length > 0 ? (
          <div className="space-y-3">
            {sorted.map((broadcast, i) => {
              const isExpanded = expandedId === broadcast._id;
              const isRecent = isNew24h(broadcast.created_at);
              const isLong = broadcast.content.length > 150;

              return (
                <div
                  key={broadcast._id}
                  className={`
                    group rounded-xl border p-4 transition-all duration-300
                    animate-[fadeSlideIn_0.3s_ease-out_both]
                    ${isRecent
                      ? "border-violet-200 dark:border-violet-700/40 bg-violet-50/30 dark:bg-violet-900/10"
                      : "border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40"
                    }
                    hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600
                  `}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Megaphone icon */}
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isRecent ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" : "bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400"}`}>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                            {broadcast.title}
                          </h3>
                          {isRecent && (
                            <span className="shrink-0 inline-flex items-center rounded-full bg-violet-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white animate-pulse">
                              New
                            </span>
                          )}
                        </div>
                        <p className={`mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed ${!isExpanded && isLong ? "line-clamp-2" : ""}`}>
                          {broadcast.content}
                        </p>
                        {isLong && (
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : broadcast._id)}
                            className="mt-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                          >
                            {isExpanded ? "Show less ↑" : "Read more ↓"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {relativeTime(broadcast.created_at)}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {broadcast.target_type === "all"
                          ? "All"
                          : broadcast.target_id
                            ? `Group`
                            : "Group"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No broadcasts yet"
            description="When your company or group sends important announcements, they will appear here."
          />
        )}
      </Card>

      <Modal
        open={isCreateOpen}
        onClose={() => {
          if (!createSubmitting) {
            setIsCreateOpen(false);
            setCreateError(null);
          }
        }}
        title="Create Broadcast"
        description="Share an announcement with everyone or with a specific group."
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                if (!createSubmitting) {
                  setIsCreateOpen(false);
                  setCreateError(null);
                }
              }}
              className="inline-flex items-center rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              disabled={createSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-broadcast-form"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-xs font-medium text-white shadow-md hover:shadow-violet-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={createSubmitting}
            >
              {createSubmitting && <span className="h-3 w-3 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />}
              {createSubmitting ? "Creating…" : "Create broadcast"}
            </button>
          </div>
        }
      >
        <form
          id="create-broadcast-form"
          onSubmit={handleCreateSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Title</label>
            <input
              type="text"
              value={createState.title}
              onChange={(event) =>
                setCreateState((prev) => ({ ...prev, title: event.target.value }))
              }
              className={inputClasses}
              placeholder="Short headline for the announcement"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Content</label>
            <textarea
              value={createState.content}
              onChange={(event) =>
                setCreateState((prev) => ({ ...prev, content: event.target.value }))
              }
              rows={4}
              className={inputClasses}
              placeholder="Full message that will be sent to recipients."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Target</label>
            <select
              value={createState.target_type}
              onChange={(event) =>
                setCreateState((prev) => ({
                  ...prev,
                  target_type: event.target.value as BroadcastTargetType,
                }))
              }
              className={inputClasses}
            >
              <option value="all">👥 All employees</option>
              <option value="group">🏷️ Specific group</option>
            </select>
          </div>

          {createState.target_type === "group" && (
            <div className="animate-[fadeSlideIn_0.3s_ease-out]">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Group ID</label>
              <input
                type="text"
                value={createState.group_id}
                onChange={(event) =>
                  setCreateState((prev) => ({ ...prev, group_id: event.target.value }))
                }
                className={inputClasses}
                placeholder="Paste the target group ID"
                required
              />
            </div>
          )}

          {createError && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 dark:border-rose-800/40 bg-rose-50 dark:bg-rose-900/20 px-3 py-2">
              <p className="text-xs text-rose-600 dark:text-rose-400">{createError}</p>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
