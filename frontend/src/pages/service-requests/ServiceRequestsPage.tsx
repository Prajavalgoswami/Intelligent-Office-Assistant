import { useEffect, useState, type FormEvent } from "react";
import { Card } from "../../components/ui/Card";
import { Table, type TableColumn } from "../../components/ui/Table";
import { StatusPill } from "../../components/ui/StatusPill";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  assignServiceRequestToSelf,
  completeServiceRequest,
  createServiceRequest,
  getServiceRequests,
  submitClientFeedback,
  type ServiceRequest,
  type ServiceRequestCreateInput,
} from "../../api/serviceRequest.api";
import { useEmployeeAuth } from "../../auth/EmployeeAuthContext";

export function ServiceRequestsPage() {
  const { hasRole, user } = useEmployeeAuth();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createPayload, setCreatePayload] = useState<ServiceRequestCreateInput>({
    title: "",
    description: "",
    category: "hardware",
  });
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);

  const canAssign = hasRole("Technical Support");
  const currentUserId = user?.user_id ?? "";

  useEffect(() => {
    void fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchRequests() {
    setLoading(true);
    setError(null);
    try {
      const response = await getServiceRequests();
      setRequests(response.data);
    } catch (err) {
      console.error("Failed to load service requests", err);
      setError("Unable to load service requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);

    if (!createPayload.title.trim() || !createPayload.description.trim()) {
      setCreateError("Title and description are required.");
      return;
    }

    setCreateSubmitting(true);
    try {
      await createServiceRequest(createPayload);
      setIsCreateOpen(false);
      setCreatePayload({
        title: "",
        description: "",
        category: "hardware",
      });
      await fetchRequests();
    } catch (err) {
      console.error("Failed to create service request", err);
      setCreateError("Unable to create service request. Please try again.");
    } finally {
      setCreateSubmitting(false);
    }
  }

  async function handleAssignToMe(id: string) {
    setAssigningId(id);
    try {
      await assignServiceRequestToSelf(id);
      await fetchRequests();
    } catch (err) {
      console.error("Failed to assign service request", err);
      // Keep list as-is but clear assigning state; error is logged
    } finally {
      setAssigningId(null);
    }
  }

  async function handleComplete(id: string) {
    setCompletingId(id);
    try {
      await completeServiceRequest(id);
      await fetchRequests();
    } catch (err) {
      console.error("Failed to complete service request", err);
    } finally {
      setCompletingId(null);
    }
  }

  async function handleClientFeedback(id: string, satisfied: boolean) {
    setFeedbackId(id);
    try {
      await submitClientFeedback(id, satisfied);
      await fetchRequests();
    } catch (err) {
      console.error("Failed to submit client feedback", err);
    } finally {
      setFeedbackId(null);
    }
  }

  const columns: TableColumn<ServiceRequest>[] = [
    {
      id: "title",
      header: "Request",
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">
              {row.title}
            </div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {row.description}
            </div>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      render: (row) => (
        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
          {row.category}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      render: (row) => <StatusPill status={row.status} />,
    },
    {
      id: "assigned_to",
      header: "Assigned To",
      render: (row) =>
        row.assigned_to ? (
          <span className="text-xs text-slate-700 dark:text-slate-200">
            {row.assigned_to}
          </span>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Unassigned
          </span>
        ),
    },
    {
      id: "created_at",
      header: "Created",
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {new Date(row.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      render: (row) => {
        const normalizedStatus = String(row.status).toLowerCase();

        const canShowAssignButton =
          canAssign && !row.assigned_to && normalizedStatus !== "resolved";

        const canShowCompleteButton =
          canAssign &&
          row.assigned_to === currentUserId &&
          normalizedStatus === "in_progress";

        const canShowClientFeedback =
          row.raised_by === currentUserId && normalizedStatus === "completed";

        if (!canShowAssignButton && !canShowCompleteButton && !canShowClientFeedback) {
          return <span className="text-xs text-slate-400 dark:text-slate-500">-</span>;
        }

        const isThisAssigning = assigningId === row._id;
        const isThisCompleting = completingId === row._id;
        const isThisFeedback = feedbackId === row._id;

        return (
          <div className="flex items-center gap-2">
            {canShowAssignButton && (
              <button
                type="button"
                onClick={() => handleAssignToMe(row._id)}
                disabled={isThisAssigning}
                className="inline-flex items-center rounded-md border border-indigo-500 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isThisAssigning ? "Assigning…" : "Assign to me"}
              </button>
            )}

            {canShowCompleteButton && (
              <button
                type="button"
                onClick={() => handleComplete(row._id)}
                disabled={isThisCompleting}
                className="inline-flex items-center rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isThisCompleting ? "Completing…" : "Complete"}
              </button>
            )}

            {canShowClientFeedback && (
              <>
                <button
                  type="button"
                  onClick={() => handleClientFeedback(row._id, true)}
                  disabled={isThisFeedback}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Satisfied"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => handleClientFeedback(row._id, false)}
                  disabled={isThisFeedback}
                  className="inline-flex items-center rounded-md border border-rose-300 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Not satisfied"
                >
                  ✕
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const hasData = requests.length > 0;

  return (
    <div className="space-y-4">
      <Card
        title="Service Requests"
        description="Track issues and requests raised across your workspace."
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            View and manage service requests. Technical Support can pick up
            unassigned items.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            Create Request
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-500">
                Loading service requests…
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <p className="text-sm font-medium text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => void fetchRequests()}
              className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
            >
              Retry
            </button>
          </div>
        ) : hasData ? (
          <Table<ServiceRequest>
            columns={columns}
            data={requests}
            emptyMessage="No service requests found."
          />
        ) : (
          <EmptyState
            title="No service requests yet"
            description="When you raise a service request, it will appear here so you and the support team can track it."
            action={
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Create your first request
              </button>
            }
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
        title="New Service Request"
        description="Describe the issue so the support team can help you quickly."
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
              form="create-service-request-form"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={createSubmitting}
            >
              {createSubmitting ? "Creating…" : "Create request"}
            </button>
          </div>
        }
      >
        <form
          id="create-service-request-form"
          onSubmit={handleCreateSubmit}
          className="space-y-3"
        >
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Title
            </label>
            <input
              type="text"
              value={createPayload.title}
              onChange={(event) =>
                setCreatePayload((prev) => ({
                  ...prev,
                  title: event.target.value,
                }))
              }
              className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
              placeholder="Short summary of the issue"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Category
            </label>
            <select
              value={createPayload.category}
              onChange={(event) =>
                setCreatePayload((prev) => ({
                  ...prev,
                  category: event.target.value,
                }))
              }
              className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              value={createPayload.description}
              onChange={(event) =>
                setCreatePayload((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              rows={4}
              className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
              placeholder="Provide more detail to help the support team understand the issue."
              required
            />
          </div>

          {createError && (
            <p className="text-xs text-red-600">{createError}</p>
          )}
        </form>
      </Modal>
    </div>
  );
}

