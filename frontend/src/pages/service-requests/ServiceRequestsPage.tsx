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

type FilterTab = "all" | "open" | "in_progress" | "resolved";

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
];

function getCategoryIcon(category: string) {
  if (category === "hardware") {
    return (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

export function ServiceRequestsPage() {
  const { hasRole, user } = useEmployeeAuth();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter + search
  const filteredRequests = requests.filter((r) => {
    const status = String(r.status).toLowerCase();
    if (activeFilter !== "all" && status !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    }
    return true;
  });

  // Count per tab
  const counts: Record<FilterTab, number> = {
    all: requests.length,
    open: requests.filter((r) => String(r.status).toLowerCase() === "open").length,
    in_progress: requests.filter((r) => String(r.status).toLowerCase() === "in_progress").length,
    resolved: requests.filter((r) => String(r.status).toLowerCase() === "resolved").length,
  };

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
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
          {getCategoryIcon(row.category)}
          <span className="capitalize">{row.category}</span>
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
          <span className="text-xs text-slate-400 dark:text-slate-500 italic">
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
          return <span className="text-xs text-slate-400 dark:text-slate-500">—</span>;
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
                className="inline-flex items-center rounded-lg border border-indigo-300 dark:border-indigo-600 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isThisAssigning ? "Assigning…" : "Assign to me"}
              </button>
            )}

            {canShowCompleteButton && (
              <button
                type="button"
                onClick={() => handleComplete(row._id)}
                disabled={isThisCompleting}
                className="inline-flex items-center rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-2.5 py-1 text-xs font-medium text-white shadow-sm hover:shadow-emerald-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
                  className="inline-flex items-center rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Satisfied"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleClientFeedback(row._id, false)}
                  disabled={isThisFeedback}
                  className="inline-flex items-center rounded-lg border border-rose-300 dark:border-rose-600 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Not satisfied"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const inputClasses =
    "block w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/80 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200";

  return (
    <div className="space-y-4">
      <Card
        title="Service Requests"
        description="Track issues and requests across your workspace."
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        }
        accentColor="rose"
      >
        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-700/40 p-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  activeFilter === tab.key
                    ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
                <span
                  className={`inline-flex items-center justify-center min-w-[1.25rem] rounded-full px-1 py-0.5 text-[10px] font-semibold ${
                    activeFilter === tab.key
                      ? "bg-indigo-100 dark:bg-indigo-800/40 text-indigo-700 dark:text-indigo-300"
                      : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search requests…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/80 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-1.5 text-xs font-medium text-white shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Request
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{error}</p>
            <button
              type="button"
              onClick={() => void fetchRequests()}
              className="inline-flex items-center rounded-xl bg-slate-900 dark:bg-slate-700 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredRequests.length > 0 ? (
          <Table<ServiceRequest>
            columns={columns}
            data={filteredRequests}
            emptyMessage="No service requests found."
          />
        ) : (
          <EmptyState
            title={searchQuery ? "No matching requests" : "No service requests yet"}
            description={
              searchQuery
                ? "Try adjusting your search or filter criteria."
                : "When you raise a service request, it will appear here."
            }
            action={
              !searchQuery ? (
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-xs font-medium text-white shadow-md hover:shadow-indigo-500/20 transition-all"
                >
                  Create your first request
                </button>
              ) : undefined
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
              className="inline-flex items-center rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              disabled={createSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-service-request-form"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-xs font-medium text-white shadow-md hover:shadow-indigo-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={createSubmitting}
            >
              {createSubmitting && <span className="h-3 w-3 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />}
              {createSubmitting ? "Creating…" : "Create request"}
            </button>
          </div>
        }
      >
        <form
          id="create-service-request-form"
          onSubmit={handleCreateSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
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
              className={inputClasses}
              placeholder="Short summary of the issue"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
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
              className={inputClasses}
            >
              <option value="hardware">🖥️ Hardware</option>
              <option value="software">💻 Software</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
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
              className={inputClasses}
              placeholder="Provide more detail to help the support team understand the issue."
              required
            />
          </div>

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
