import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Modal } from "../../components/ui/Modal";
import {
  addMemberToGroup,
  createGroup,
  deleteMessage,
  getGroupMessages,
  listGroupMembers,
  listGroups,
  markMessageRead,
  sendGroupMessage,
  type ChatGroup as ApiChatGroup,
  type GroupMemberInfo,
  type CreateGroupPayload,
  type DeleteType,
  type GroupCategory,
  type GroupMessage,
} from "../../api/chat.api";
import { getCompanyUsers, type CompanyUser } from "../../api/employee.api";
import { useEmployeeAuth } from "../../auth/EmployeeAuthContext";

interface ChatGroup {
  id: string;
  group_name: string;
  group_category: GroupCategory;
  group_lead_id?: string;
  created_by?: string;
}

type ComposerState = "idle" | "sending";

function getGroupInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const groupGradients = [
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-purple-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-indigo-500 to-blue-500",
];

function getGroupGradient(index: number): string {
  return groupGradients[index % groupGradients.length];
}

export function ChatPage() {
  const { user } = useEmployeeAuth();

  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [composerValue, setComposerValue] = useState<string>("");
  const [composerState, setComposerState] = useState<ComposerState>("idle");

  const [deleteBusyId, setDeleteBusyId] = useState<string | null>(null);

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState<boolean>(false);
  const [createGroupPayload, setCreateGroupPayload] =
    useState<CreateGroupPayload>({
      group_name: "",
      group_category: "project",
    });
  const [createGroupSubmitting, setCreateGroupSubmitting] =
    useState<boolean>(false);
  const [createGroupError, setCreateGroupError] = useState<string | null>(null);

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [addMemberUserId, setAddMemberUserId] = useState("");
  const [addMemberSubmitting, setAddMemberSubmitting] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [groupMembers, setGroupMembers] = useState<GroupMemberInfo[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  const currentUserId = user?.user_id ?? "";

  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  );

  const isGroupLead = useMemo(
    () =>
      !!selectedGroup &&
      (selectedGroup.group_lead_id === currentUserId ||
        selectedGroup.created_by === currentUserId),
    [selectedGroup, currentUserId],
  );

  useEffect(() => {
    async function load() {
      setGroupsLoading(true);
      try {
        const res = await listGroups();
        const list = (res.data ?? []) as ApiChatGroup[];
        setGroups(
          list.map((g) => {
            const api = g as ApiChatGroup & { group_lead_id?: string; created_by?: string };
            return {
              id: g._id,
              group_name: g.group_name,
              group_category: g.group_category,
              group_lead_id: api.group_lead_id,
              created_by: api.created_by,
            };
          })
        );
        if (list.length > 0 && !selectedGroupId) {
          setSelectedGroupId(list[0]._id);
        }
      } catch {
        setGroups([]);
      } finally {
        setGroupsLoading(false);
      }
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedGroupId) return;
    void fetchMessages(selectedGroupId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroupId]);

  useEffect(() => {
    if (scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  const hasGroups = groups.length > 0;
  const hasMessages = messages.length > 0;

  function handleScroll() {
    if (!scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!isNearBottom);
  }

  function scrollToBottom() {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function fetchMessages(groupId: string): Promise<void> {
    setMessagesLoading(true);
    setMessagesError(null);
    try {
      const response = await getGroupMessages(groupId);
      const items = response.data ?? [];
      setMessages(items.slice().reverse());

      void markMessagesAsRead(items);
    } catch (error) {
      console.error("Failed to load group messages", error);
      setMessagesError(
        "Unable to load messages for this group. Please try again.",
      );
    } finally {
      setMessagesLoading(false);
    }
  }

  async function markMessagesAsRead(items: GroupMessage[]): Promise<void> {
    if (!items.length) return;
    try {
      await Promise.allSettled(
        items.map((msg) => markMessageRead(msg._id)),
      );
    } catch {
    }
  }

  async function handleCreateGroupSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setCreateGroupError(null);

    const name = createGroupPayload.group_name.trim();
    if (!name) {
      setCreateGroupError("Group name is required.");
      return;
    }

    setCreateGroupSubmitting(true);
    try {
      const response = await createGroup(createGroupPayload);
      const groupId = response.data.group_id;

      const newGroup: ChatGroup = {
        id: groupId,
        group_name: createGroupPayload.group_name,
        group_category: createGroupPayload.group_category,
      };

      setGroups((prev) => [newGroup, ...prev]);
      setSelectedGroupId(groupId);

      setIsCreateGroupOpen(false);
      setCreateGroupPayload({
        group_name: "",
        group_category: "project",
      });
    } catch (error) {
      console.error("Failed to create group", error);
      setCreateGroupError(
        "Unable to create group. You may not have permission, or this name is already in use.",
      );
    } finally {
      setCreateGroupSubmitting(false);
    }
  }

  const handleSelectGroup = useCallback((groupId: string) => {
    setSelectedGroupId(groupId);
  }, []);

  async function handleSendMessage(): Promise<void> {
    if (!selectedGroupId) {
      return;
    }
    const trimmed = composerValue.trim();
    if (!trimmed || composerState === "sending") {
      return;
    }

    setComposerState("sending");

    try {
      await sendGroupMessage(selectedGroupId, { content: trimmed });
      setComposerValue("");
      await fetchMessages(selectedGroupId);
    } catch (error) {
      console.error("Failed to send group message", error);
    } finally {
      setComposerState("idle");
    }
  }

  function handleComposerSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void handleSendMessage();
  }

  function handleComposerKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  }

  async function handleDeleteMessage(
    messageId: string,
    deleteType: DeleteType,
  ): Promise<void> {
    setDeleteBusyId(messageId);
    try {
      await deleteMessage(messageId, deleteType);
      if (selectedGroupId) {
        await fetchMessages(selectedGroupId);
      }
    } catch (error) {
      console.error("Failed to delete message", error);
    } finally {
      setDeleteBusyId(null);
    }
  }

  const inputClasses =
    "block w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/80 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200";

  return (
    <div className="space-y-4">
      <Card
        title="Team Chat"
        description="Create focused groups for collaboration."
        className="h-[calc(100vh-9rem)]"
        fillHeight
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        }
        accentColor="blue"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Use chat groups to coordinate with colleagues.
          </p>
          <button
            type="button"
            onClick={() => {
              if (!createGroupSubmitting) {
                setIsCreateGroupOpen(true);
                setCreateGroupError(null);
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-1.5 text-xs font-medium text-white shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Group
          </button>
        </div>

        <div className="flex flex-1 min-h-0 gap-4">
          {/* Sidebar */}
          <aside className="w-60 shrink-0 border-r border-slate-200 dark:border-slate-700/60 pr-3 flex flex-col">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Groups
            </h3>
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1 custom-scrollbar">
              {groupsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-2.5 rounded-xl p-2">
                      <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="h-2 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : hasGroups ? (
                groups.map((group, i) => {
                  const isActive = group.id === selectedGroupId;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => handleSelectGroup(group.id)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all duration-200 animate-[fadeSlideIn_0.3s_ease-out_both] ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700/50 shadow-sm"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent"
                      }`}
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${getGroupGradient(i)} text-[10px] font-bold text-white shadow-sm`}>
                        {getGroupInitials(group.group_name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-medium truncate ${isActive ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-200"}`}>
                          {group.group_name}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          {group.group_category === "organizational" ? "Org" : "Project"}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <EmptyState
                  title="No groups yet"
                  description="Create your first chat group."
                  action={
                    <button
                      type="button"
                      onClick={() => {
                        if (!createGroupSubmitting) {
                          setIsCreateGroupOpen(true);
                          setCreateGroupError(null);
                        }
                      }}
                      className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-md transition-all"
                    >
                      Create a group
                    </button>
                  }
                />
              )}
            </div>
          </aside>

          {/* Chat Area */}
          <section className="flex-1 min-w-0 flex flex-col">
            {selectedGroup ? (
              <>
                {/* Header */}
                <header className="mb-2 flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${getGroupGradient(groups.findIndex(g => g.id === selectedGroupId))} text-xs font-bold text-white shadow-sm`}>
                      {getGroupInitials(selectedGroup.group_name)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {selectedGroup.group_name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {selectedGroup.group_category === "organizational" ? "Organizational" : "Project"} group
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isGroupLead && (
                      <button
                        type="button"
                        onClick={async () => {
                          setIsAddMemberOpen(true);
                          setAddMemberError(null);
                          setAddMemberUserId("");
                          try {
                            const res = await getCompanyUsers();
                            setCompanyUsers(res.data ?? []);
                          } catch {
                            setCompanyUsers([]);
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700/60 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Add
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        if (!selectedGroupId) return;
                        setIsMembersOpen(true);
                        setMembersLoading(true);
                        setMembersError(null);
                        setGroupMembers([]);
                        try {
                          const res = await listGroupMembers(selectedGroupId);
                          const list = res.data;
                          setGroupMembers(Array.isArray(list) ? list : []);
                        } catch (e) {
                          console.error("Failed to load group members", e);
                          setMembersError("Could not load members.");
                          setGroupMembers([]);
                        } finally {
                          setMembersLoading(false);
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700/60 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Members
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedGroupId) void fetchMessages(selectedGroupId);
                      }}
                      className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700/60 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </header>

                {/* Messages */}
                <div className="relative flex-1 min-h-0">
                  <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="absolute inset-0 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/30 px-4 py-4 space-y-3 custom-scrollbar"
                  >
                    {messagesLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                          <p className="text-xs text-slate-500 dark:text-slate-400">Loading messages…</p>
                        </div>
                      </div>
                    ) : messagesError ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center space-y-2">
                          <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{messagesError}</p>
                          <button
                            type="button"
                            onClick={() => { if (selectedGroupId) void fetchMessages(selectedGroupId); }}
                            className="inline-flex items-center rounded-xl bg-slate-900 dark:bg-slate-700 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
                          >
                            Retry
                          </button>
                        </div>
                      </div>
                    ) : hasMessages ? (
                      <>
                        {messages.map((message) => {
                          const isMine = message.sender_id === currentUserId;
                          return (
                            <div
                              key={message._id}
                              className={`flex gap-2 ${isMine ? "justify-end" : "justify-start"} animate-[${isMine ? "slideInRight" : "slideInLeft"}_0.3s_ease-out]`}
                            >
                              {!isMine && (
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 text-[9px] font-bold text-white mt-auto">
                                  {(message.sender_name || message.sender_id).charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div
                                className={`inline-flex max-w-[75%] flex-col px-4 py-2.5 text-sm shadow-sm transition-all duration-200 ${
                                  isMine
                                    ? "rounded-2xl rounded-br-sm bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
                                    : "rounded-2xl rounded-bl-sm border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3 mb-0.5">
                                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${isMine ? "text-blue-100" : "text-slate-400 dark:text-slate-500"}`}>
                                    {isMine ? "You" : message.sender_name || message.sender_id}
                                  </span>
                                  <span className={`text-[10px] ${isMine ? "text-blue-200/70" : "text-slate-400 dark:text-slate-500"}`}>
                                    {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                                <p className="whitespace-pre-wrap break-words text-xs leading-relaxed">
                                  {message.content}
                                </p>
                              </div>
                              {isMine && (
                                <div className="relative mt-auto">
                                  <details className="group">
                                    <summary className="list-none cursor-pointer inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700/60 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                      </svg>
                                    </summary>
                                    <div className="absolute right-0 mt-1 w-36 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg z-10 text-xs overflow-hidden animate-[scaleIn_0.15s_ease-out]">
                                      <button
                                        type="button"
                                        disabled={deleteBusyId === message._id}
                                        onClick={() => void handleDeleteMessage(message._id, "me")}
                                        className="block w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60 transition-colors"
                                      >
                                        Delete for me
                                      </button>
                                      {message.sender_id === currentUserId && (
                                        <button
                                          type="button"
                                          disabled={deleteBusyId === message._id}
                                          onClick={() => void handleDeleteMessage(message._id, "everyone")}
                                          className="block w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-60 transition-colors"
                                        >
                                          Delete for everyone
                                        </button>
                                      )}
                                    </div>
                                  </details>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <div ref={scrollAnchorRef} />
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center max-w-sm animate-[fadeSlideIn_0.5s_ease-out]">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No messages yet.</p>
                          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Start the conversation!</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {showScrollBtn && (
                    <button
                      type="button"
                      onClick={scrollToBottom}
                      className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all animate-[scaleIn_0.2s_ease-out]"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Composer */}
                <form
                  onSubmit={handleComposerSubmit}
                  className="mt-3 flex items-end gap-2 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 px-4 py-3 shadow-sm"
                >
                  <div className="flex-1">
                    <label className="sr-only" htmlFor="chat-composer">Message group</label>
                    <textarea
                      id="chat-composer"
                      value={composerValue}
                      onChange={(event) => setComposerValue(event.target.value)}
                      onKeyDown={handleComposerKeyDown}
                      rows={2}
                      className="block w-full resize-none border-0 bg-transparent px-0 py-1.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0"
                      placeholder="Type a message…"
                      disabled={composerState === "sending"}
                    />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <button
                      type="submit"
                      disabled={composerState === "sending" || !composerValue.trim()}
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-xs font-medium text-white shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {composerState === "sending" ? (
                        <span className="flex items-center gap-1.5">
                          <span className="h-3 w-3 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                          Sending…
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                          </svg>
                          Send
                        </span>
                      )}
                    </button>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Enter · Shift+Enter ↵</p>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <EmptyState
                  title="Select or create a group"
                  description="Choose a group from the left, or create one to start collaborating."
                />
              </div>
            )}
          </section>
        </div>

        {/* Create Group Modal */}
        <Modal
          open={isCreateGroupOpen}
          onClose={() => { if (!createGroupSubmitting) { setIsCreateGroupOpen(false); setCreateGroupError(null); } }}
          title="Create Chat Group"
          description="Set up a focused space for collaboration."
          footer={
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => { if (!createGroupSubmitting) { setIsCreateGroupOpen(false); setCreateGroupError(null); } }}
                className="inline-flex items-center rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" disabled={createGroupSubmitting}>
                Cancel
              </button>
              <button type="submit" form="create-chat-group-form"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-xs font-medium text-white shadow-md hover:shadow-indigo-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed" disabled={createGroupSubmitting}>
                {createGroupSubmitting && <span className="h-3 w-3 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />}
                {createGroupSubmitting ? "Creating…" : "Create group"}
              </button>
            </div>
          }
        >
          <form id="create-chat-group-form" onSubmit={handleCreateGroupSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Group name</label>
              <input type="text" value={createGroupPayload.group_name} onChange={(e) => setCreateGroupPayload((p) => ({ ...p, group_name: e.target.value }))} className={inputClasses} placeholder="e.g. Engineering Standup" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Category</label>
              <select value={createGroupPayload.group_category} onChange={(e) => setCreateGroupPayload((p) => ({ ...p, group_category: e.target.value as GroupCategory }))} className={inputClasses}>
                <option value="organizational">🏢 Organizational</option>
                <option value="project">🚀 Project</option>
              </select>
            </div>
            {createGroupError && <div className="flex items-center gap-2 rounded-lg border border-rose-200 dark:border-rose-800/40 bg-rose-50 dark:bg-rose-900/20 px-3 py-2"><p className="text-xs text-rose-600 dark:text-rose-400">{createGroupError}</p></div>}
          </form>
        </Modal>

        {/* Members Modal */}
        <Modal open={isMembersOpen} onClose={() => setIsMembersOpen(false)} title="Group Members" description="People in this chat group."
          footer={<button type="button" onClick={() => setIsMembersOpen(false)} className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-xs font-medium text-white shadow-md transition-all">Close</button>}
        >
          {membersLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 rounded-xl p-2">
                  <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-2 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : membersError ? (
            <p className="text-xs text-rose-600 dark:text-rose-400">{membersError}</p>
          ) : groupMembers.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">No members found.</p>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto custom-scrollbar">
              {groupMembers.map((m) => (
                <li key={m.user_id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-700/60 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-[10px] font-bold text-white">
                      {(m.name || m.email || m.user_id).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{m.name || m.email || m.user_id}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.username ? `@${m.username}` : m.email}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400">{m.role}</span>
                </li>
              ))}
            </ul>
          )}
        </Modal>

        {/* Add Member Modal */}
        <Modal open={isAddMemberOpen}
          onClose={() => { if (!addMemberSubmitting) { setIsAddMemberOpen(false); setAddMemberError(null); } }}
          title="Add Member"
          description="Select a colleague to add to this group."
          footer={
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => { if (!addMemberSubmitting) { setIsAddMemberOpen(false); setAddMemberError(null); } }}
                className="inline-flex items-center rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" disabled={addMemberSubmitting}>
                Cancel
              </button>
              <button type="submit" form="add-member-form"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-xs font-medium text-white shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed" disabled={addMemberSubmitting || !addMemberUserId}>
                {addMemberSubmitting && <span className="h-3 w-3 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />}
                {addMemberSubmitting ? "Adding…" : "Add member"}
              </button>
            </div>
          }
        >
          <form id="add-member-form" onSubmit={async (e: FormEvent) => {
            e.preventDefault();
            if (!selectedGroupId || !addMemberUserId || addMemberSubmitting) return;
            setAddMemberSubmitting(true);
            setAddMemberError(null);
            try {
              await addMemberToGroup(selectedGroupId, { user_id: addMemberUserId });
              setIsAddMemberOpen(false);
              setAddMemberUserId("");
            } catch (err: unknown) {
              const msg = err && typeof err === "object" && "response" in err
                ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
                : "Failed to add member";
              setAddMemberError(typeof msg === "string" ? msg : "Failed to add member");
            } finally {
              setAddMemberSubmitting(false);
            }
          }} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Select user</label>
              <select value={addMemberUserId} onChange={(e) => setAddMemberUserId(e.target.value)} className={inputClasses}>
                <option value="">Choose a colleague…</option>
                {companyUsers.filter((u) => u.user_id !== currentUserId).map((u) => (
                  <option key={u.user_id} value={u.user_id}>{u.display || u.name || u.email}</option>
                ))}
              </select>
            </div>
            {addMemberError && <div className="flex items-center gap-2 rounded-lg border border-rose-200 dark:border-rose-800/40 bg-rose-50 dark:bg-rose-900/20 px-3 py-2"><p className="text-xs text-rose-600 dark:text-rose-400">{addMemberError}</p></div>}
          </form>
        </Modal>
      </Card>
    </div>
  );
}
