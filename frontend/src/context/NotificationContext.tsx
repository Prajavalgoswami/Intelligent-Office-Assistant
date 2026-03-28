import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getMyBroadcasts,
  type BroadcastMessage,
} from "../api/broadcast.api";

interface NotificationContextValue {
  unreadBroadcasts: BroadcastMessage[];
  unreadBroadcastCount: number;
  refreshNotifications: () => Promise<void>;
  markBroadcastsSeen: () => void;
  loading: boolean;
  error: string | null;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSeenBroadcastAt, setLastSeenBroadcastAt] = useState<number>(() => {
    try {
      const raw = window.localStorage.getItem("ioa_last_seen_broadcast_at");
      const parsed = raw ? Number(raw) : 0;
      return Number.isFinite(parsed) ? parsed : 0;
    } catch {
      return 0;
    }
  });

  const refreshNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMyBroadcasts();
      setBroadcasts(response.data ?? []);
    } catch {
      setError("Unable to refresh notifications right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  const markBroadcastsSeen = useCallback(() => {
    const now = Date.now();
    setLastSeenBroadcastAt(now);
    try {
      window.localStorage.setItem("ioa_last_seen_broadcast_at", String(now));
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refreshNotifications();
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshNotifications]);

  const unreadBroadcasts = useMemo(() => {
    return broadcasts.filter((broadcast) => {
      const createdAtTime = new Date(broadcast.created_at).getTime();
      if (Number.isNaN(createdAtTime)) {
        return false;
      }
      return createdAtTime > lastSeenBroadcastAt;
    });
  }, [broadcasts, lastSeenBroadcastAt]);

  const value: NotificationContextValue = {
    unreadBroadcasts,
    unreadBroadcastCount: unreadBroadcasts.length,
    refreshNotifications,
    markBroadcastsSeen,
    loading,
    error,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }

  return context;
}

