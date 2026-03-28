import { useEffect, useState, type FormEvent } from "react";
import { Card } from "../../components/ui/Card";
import { Table, type TableColumn } from "../../components/ui/Table";
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

  const columns: TableColumn<BroadcastMessage>[] = [
    {
      id: "title",
      header: "Title",
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {row.title}
          </div>
          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            {row.content}
          </div>
        </div>
      ),
    },
    {
      id: "target",
      header: "Target",
      render: (row) => (
        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-600">
          {row.target_type === "all"
            ? "All"
            : row.target_id
              ? `Group • ${row.target_id}`
              : "Group"}
        </span>
      ),
    },
    {
      id: "created_at",
      header: "Created",
      render: (row) => (
        <span className="text-xs text-slate-500">
          {new Date(row.created_at).toLocaleString()}
        </span>
      ),
    },
  ];

  const hasData = broadcasts.length > 0;

  return (
    <div className="space-y-4">
      <Card
        title="Broadcasts"
        description="Review important announcements sent to you and your groups."
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Company announcements and group broadcasts appear here in
            chronological order.
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
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Create Broadcast
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-500">Loading broadcasts…</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <p className="text-sm font-medium text-rose-600">{error}</p>
            <button
              type="button"
              onClick={() => void fetchBroadcasts()}
              className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
            >
              Retry
            </button>
          </div>
        ) : hasData ? (
          <Table<BroadcastMessage>
            columns={columns}
            data={broadcasts}
            emptyMessage="No broadcasts found."
          />
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
        title="Create broadcast"
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
              className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              disabled={createSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-broadcast-form"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={createSubmitting}
            >
              {createSubmitting ? "Creating…" : "Create broadcast"}
            </button>
          </div>
        }
      >
        <form
          id="create-broadcast-form"
          onSubmit={handleCreateSubmit}
          className="space-y-3"
        >
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Title
            </label>
            <input
              type="text"
              value={createState.title}
              onChange={(event) =>
                setCreateState((prev) => ({
                  ...prev,
                  title: event.target.value,
                }))
              }
              className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
              placeholder="Short headline for the announcement"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Content
            </label>
            <textarea
              value={createState.content}
              onChange={(event) =>
                setCreateState((prev) => ({
                  ...prev,
                  content: event.target.value,
                }))
              }
              rows={4}
              className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
              placeholder="Full message that will be sent to recipients."
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Target
            </label>
            <select
              value={createState.target_type}
              onChange={(event) =>
                setCreateState((prev) => ({
                  ...prev,
                  target_type: event.target.value as BroadcastTargetType,
                }))
              }
              className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">All employees</option>
              <option value="group">Specific group</option>
            </select>
            <p className="mt-1 text-[11px] text-slate-400">
              Choose whether to send this announcement to everyone or only to a
              single chat group.
            </p>
          </div>

          {createState.target_type === "group" && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Group ID
              </label>
              <input
                type="text"
                value={createState.group_id}
                onChange={(event) =>
                  setCreateState((prev) => ({
                    ...prev,
                    group_id: event.target.value,
                  }))
                }
                className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
                placeholder="Paste the target group ID"
                required
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Use the identifier of an existing chat group. Members of that
                group will receive this broadcast.
              </p>
            </div>
          )}

          {createError && (
            <p className="text-xs text-rose-600">{createError}</p>
          )}
        </form>
      </Modal>
    </div>
  );
}

