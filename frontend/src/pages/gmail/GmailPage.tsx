import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Table, type TableColumn } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  autoOrganizeEmails,
  getGmailFullMessages,
  getGmailStatus,
  getGoogleAuthUrl,
  type GmailMessage,
} from "../../api/gmail.api";

type GmailConnectionState = "checking" | "connected" | "disconnected";

export function GmailPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [connectionState, setConnectionState] =
    useState<GmailConnectionState>("checking");
  const [statusError, setStatusError] = useState<string | null>(null);

  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [autoOrganizing, setAutoOrganizing] = useState<boolean>(false);
  const [autoOrganizeMessage, setAutoOrganizeMessage] = useState<string | null>(
    null,
  );
  const [autoOrganizeError, setAutoOrganizeError] = useState<string | null>(
    null,
  );

  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    void fetchStatusAndMessages();
    const connected = searchParams.get("google_connected");
    const error = searchParams.get("google_error");
    if (connected || error) {
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchStatusAndMessages(): Promise<void> {
    setConnectionState("checking");
    setStatusError(null);

    try {
      const response = await getGmailStatus();
      const connected = !!response.data?.email;

      setConnectionState(connected ? "connected" : "disconnected");

      if (connected) {
        await fetchMessages();
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to check Gmail status", error);
      setConnectionState("disconnected");
      setStatusError(
        "We could not verify your Gmail connection. You may need to reconnect Google.",
      );
      setMessages([]);
    }
  }

  async function fetchMessages(): Promise<void> {
    setMessagesLoading(true);
    setMessagesError(null);

    try {
      const response = await getGmailFullMessages();
      const newMessages = response.data?.emails ?? [];
  
      setMessages(newMessages);
  
      if (
        selectedCategory !== "all" &&
        !newMessages.some((m) => m.category === selectedCategory)
      ) {
        setSelectedCategory("all");
      }
  
    } catch (error) {
      console.error("Failed to load Gmail messages", error);
      setMessagesError(
        "Unable to load your Gmail messages. Please try again.",
      );
    } finally {
      setMessagesLoading(false);
    }
  }

  const categories = useMemo<string[]>(() => {
    const unique = new Set<string>();
    for (const message of messages) {
      if (message.category) {
        unique.add(message.category);
      }
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [messages]);

  const filteredMessages = useMemo<GmailMessage[]>(() => {
    if (selectedCategory === "all") {
      return messages;
    }
    return messages.filter((message) => message.category === selectedCategory);
  }, [messages, selectedCategory]);

  async function handleRunAutoOrganize(): Promise<void> {
    setAutoOrganizing(true);
    setAutoOrganizeMessage(null);
    setAutoOrganizeError(null);

    try {
      const response = await autoOrganizeEmails();
      const message = response.data?.message ?? "Auto organize completed.";
      setAutoOrganizeMessage(message);
      await fetchMessages();
    } catch (error) {
      console.error("Failed to auto-organize emails", error);
      setAutoOrganizeError(
        "We could not run auto-organize. Please try again.",
      );
    } finally {
      setAutoOrganizing(false);
    }
  }

  async function handleConnectGoogle(): Promise<void> {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await getGoogleAuthUrl();
      const url = response.data?.auth_url;

      if (url) {
        window.location.href = url;
      } else {
        setAuthError(
          "Unable to start Google sign-in. Please contact your administrator.",
        );
        setAuthLoading(false);
      }
    } catch (error) {
      console.error("Failed to start Google auth", error);
      setAuthError("Unable to connect to Google. Please try again.");
      setAuthLoading(false);
    }
  }

  function handleOpenInGmail(messageId: string): void {
    if (!messageId) return;
    const url = `https://mail.google.com/mail/u/0/#inbox/${encodeURIComponent(messageId)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function getFilterButtonClasses(isActive: boolean): string {
    const base =
      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors";
    if (isActive) {
      return `${base} border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-600`;
    }
    return `${base} border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700`;
  }

  const columns: TableColumn<GmailMessage>[] = [
    {
      id: "subject",
      header: "Subject",
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900 line-clamp-2 dark:text-white">
            {row.subject || "(No subject)"}
          </div>
          <div className="mt-0.5 text-xs text-slate-500 line-clamp-1 dark:text-slate-400">
            {row.sender}
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      render: (row) => <Badge variant="muted">{row.category || "Uncategorized"}</Badge>,
    },
    {
      id: "timestamp",
      header: "Date",
      render: (row) => {
        const date = new Date(row.timestamp);
        const value = Number.isNaN(date.getTime())
          ? "-"
          : date.toLocaleString();
        return <span className="text-xs text-slate-500">{value}</span>;
      },
    },
    {
      id: "actions",
      header: "Open",
      render: (row) => (
        <button
          type="button"
          onClick={() => handleOpenInGmail(row.message_id)}
          className="inline-flex items-center rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Open in Gmail
        </button>
      ),
    },
  ];

  const isCheckingConnection = connectionState === "checking";
  const isConnected = connectionState === "connected";

  return (
    <div className="space-y-4">
      <Card
        title="Gmail Smart Mail"
        description="Connect your work Gmail account and automatically organize messages into smart categories."
      >
        {isCheckingConnection ? (
          <div className="flex justify-center py-10">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-500">
                Checking your Gmail connection…
              </p>
            </div>
          </div>
        ) : isConnected ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-slate-500">
                  Review how Smart Mail groups your recent messages. Run auto
                  organize to re-apply the latest rules.
                </p>
                {autoOrganizeMessage && (
                  <p className="mt-1 text-xs text-emerald-600">
                    {autoOrganizeMessage}
                  </p>
                )}
                {autoOrganizeError && (
                  <p className="mt-1 text-xs text-rose-600">
                    {autoOrganizeError}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => void handleRunAutoOrganize()}
                disabled={autoOrganizing || messagesLoading}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {autoOrganizing ? "Running…" : "Run Auto Organize"}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-600">
                Categories:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={getFilterButtonClasses(selectedCategory === "all")}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={getFilterButtonClasses(
                    selectedCategory === category,
                  )}
                >
                  {category}
                </button>
              ))}
            </div>

            {messagesLoading ? (
              <div className="flex justify-center py-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  <p className="text-xs text-slate-500">
                    Loading your Gmail messages…
                  </p>
                </div>
              </div>
            ) : messagesError ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <p className="text-sm font-medium text-rose-600">
                  {messagesError}
                </p>
                <button
                  type="button"
                  onClick={() => void fetchMessages()}
                  className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                >
                  Retry
                </button>
              </div>
            ) : (
              <Table<GmailMessage>
                columns={columns}
                data={filteredMessages}
                emptyMessage="No emails found for this view."
              />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <EmptyState
              title="Connect your Google account"
              description="Link your work Gmail so Smart Mail can fetch messages and apply automatic organization."
              action={
                <button
                  type="button"
                  onClick={() => void handleConnectGoogle()}
                  disabled={authLoading}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {authLoading ? "Connecting…" : "Connect Google"}
                </button>
              }
            />
            {(statusError || authError) && (
              <p className="text-xs text-center text-rose-600">
                {authError ?? statusError}
              </p>
            )}
            {!authLoading && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => void fetchStatusAndMessages()}
                  className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Check status again
                </button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

