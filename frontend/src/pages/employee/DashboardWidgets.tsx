import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  getServiceRequests,
  type ServiceRequest,
} from "../../api/serviceRequest.api";
import {
  getMyBroadcasts,
  type BroadcastMessage,
} from "../../api/broadcast.api";
import { getGmailStatus, type GmailStatusResponse } from "../../api/gmail.api";

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

export function DashboardWidgets() {
  const [state, setState] = useState<DashboardState>(initialState);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          serviceRequestsResponse,
          broadcastsResponse,
          gmailStatusResponse,
        ] = await Promise.all([
          getServiceRequests(),
          getMyBroadcasts(),
          getGmailStatus(),
        ]);

        if (!isMounted) {
          return;
        }

        const serviceRequests = serviceRequestsResponse.data ?? [];
        const broadcasts = broadcastsResponse.data ?? [];
        const gmailStatus: GmailStatusResponse | undefined =
          gmailStatusResponse.data;

        const openRequestsCount = serviceRequests.filter(
          (request: ServiceRequest) => request.status !== "resolved",
        ).length;

        const latestBroadcasts = [...broadcasts].sort((a, b) => {
          const aTime = new Date(a.created_at).getTime();
          const bTime = new Date(b.created_at).getTime();
          if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
            return 0;
          }
          return bTime - aTime;
        }).slice(0, 3);

        const gmailConnected = Boolean(gmailStatus?.email);

        setState({
          openRequestsCount,
          latestBroadcasts,
          gmailConnected,
        });
      } catch {
        if (isMounted) {
          setError("Unable to load dashboard insights at the moment.");
          setState(initialState);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    const intervalId = window.setInterval(() => {
      void fetchData();
    }, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card
        title="Service Requests"
        description="Open service requests that still need attention."
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Loading requests…
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-slate-900 dark:text-white">
              {state.openRequestsCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-300">
              open {state.openRequestsCount === 1 ? "ticket" : "tickets"}
            </span>
          </div>
        )}
        {error && (
          <p className="mt-3 text-xs text-rose-600">
            {error}
          </p>
        )}
      </Card>

      <Card
        title="Latest Broadcasts"
        description="Most recent announcements sent to you."
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Loading broadcasts…
              </p>
            </div>
          </div>
        ) : state.latestBroadcasts.length === 0 ? (
          <EmptyState
            title="No recent broadcasts"
            description="New company or team announcements will appear here."
          />
        ) : (
          <ul className="space-y-3">
            {state.latestBroadcasts.map((broadcast) => (
              <li key={broadcast._id} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
                    {broadcast.title}
                  </p>
                  <span className="text-[11px] text-slate-500 dark:text-slate-300">
                    {new Date(broadcast.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-300 line-clamp-2">
                  {broadcast.content}
                </p>
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p className="mt-3 text-xs text-rose-600">
            {error}
          </p>
        )}
      </Card>

      <Card
        title="Gmail Connection"
        description="Status of your work Gmail integration."
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Checking Gmail status…
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Badge variant={state.gmailConnected ? "success" : "danger"}>
              {state.gmailConnected ? "Connected" : "Not connected"}
            </Badge>
            <p className="text-xs text-slate-500 dark:text-slate-300">
              {state.gmailConnected
                ? "Your Gmail is connected for smart email workflows."
                : "Connect your Gmail from the Gmail workspace to enable smart email workflows."}
            </p>
          </div>
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