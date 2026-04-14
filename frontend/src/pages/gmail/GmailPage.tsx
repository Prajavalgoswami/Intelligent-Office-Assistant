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

const categoryColors: Record<string, string> = {
  important: "bg-rose-500",
  promotions: "bg-amber-500",
  social: "bg-blue-500",
  updates: "bg-emerald-500",
  forums: "bg-violet-500",
  personal: "bg-pink-500",
};

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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: messages.length };
    for (const msg of messages) {
      if (msg.category) {
        counts[msg.category] = (counts[msg.category] || 0) + 1;
      }
    }
    return counts;
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
      render: (row) => {
        const cat = row.category?.toLowerCase() ?? "";
        const dotColor = categoryColors[cat] ?? "bg-slate-400";
        return (
          <span className="inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${dotColor}`} />
            <Badge variant="muted">{row.category || "Uncategorized"}</Badge>
          </span>
        );
      },
    },
    {
      id: "timestamp",
      header: "Date",
      render: (row) => {
        const date = new Date(row.timestamp);
        const value = Number.isNaN(date.getTime())
          ? "-"
          : date.toLocaleString();
        return <span className="text-xs text-slate-500 dark:text-slate-400">{value}</span>;
      },
    },
    {
      id: "actions",
      header: "Open",
      render: (row) => (
        <button
          type="button"
          onClick={() => handleOpenInGmail(row.message_id)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-600 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Gmail
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
        description="Connect your work Gmail and automatically organize messages."
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
        accentColor="blue"
      >
        {isCheckingConnection ? (
          <div className="flex justify-center py-10">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Checking your Gmail connection…
              </p>
            </div>
          </div>
        ) : isConnected ? (
          <div className="space-y-4">
            {/* Connection status + Auto organize bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700/40 p-3">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                </span>
                <div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Gmail Connected</p>
                  {autoOrganizeMessage && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400">{autoOrganizeMessage}</p>
                  )}
                  {autoOrganizeError && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400">{autoOrganizeError}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleRunAutoOrganize()}
                disabled={autoOrganizing || messagesLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-xs font-medium text-white shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {autoOrganizing ? (
                  <>
                    <span className="h-3 w-3 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                    Running…
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Auto Organize
                  </>
                )}
              </button>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Filter:</span>
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  selectedCategory === "all"
                    ? "border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm"
                    : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                All
                <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-slate-200 dark:bg-slate-600 px-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                  {categoryCounts.all || 0}
                </span>
              </button>
              {categories.map((category) => {
                const cat = category.toLowerCase();
                const dotColor = categoryColors[cat] ?? "bg-slate-400";
                const isActive = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? "border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm"
                        : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                    {category}
                    <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-slate-200 dark:bg-slate-600 px-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      {categoryCounts[category] || 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {messagesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
                  </div>
                ))}
              </div>
            ) : messagesError ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                  {messagesError}
                </p>
                <button
                  type="button"
                  onClick={() => void fetchMessages()}
                  className="inline-flex items-center rounded-xl bg-slate-900 dark:bg-slate-700 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
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
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-xs font-medium text-white shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {authLoading ? (
                    <>
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                      Connecting…
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Connect Google
                    </>
                  )}
                </button>
              }
            />
            {(statusError || authError) && (
              <p className="text-xs text-center text-rose-600 dark:text-rose-400">
                {authError ?? statusError}
              </p>
            )}
            {!authLoading && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => void fetchStatusAndMessages()}
                  className="inline-flex items-center rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
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
