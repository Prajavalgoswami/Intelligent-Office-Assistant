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

  return (
    <div className="space-y-4">
      <Card
        title="Team Chat"
        description="Create focused groups for organizational and project collaboration."
        className="h-[calc(100vh-9rem)] flex flex-col"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Use chat groups to coordinate work with colleagues. Messages are
            delivered instantly and can be managed per group.
          </p>
          <button
              type="button"
              onClick={() => {
                if (!createGroupSubmitting) {
                  setIsCreateGroupOpen(true);
                  setCreateGroupError(null);
                }
              }}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Create Group
            </button>
        </div>

        <div className="flex flex-1 min-h-0 gap-4">
          <aside className="w-56 shrink-0 border-r border-slate-200 pr-3 flex flex-col">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Groups
            </h3>
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
              {groupsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                </div>
              ) : hasGroups ? (
                groups.map((group) => {
                  const isActive = group.id === selectedGroupId;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => handleSelectGroup(group.id)}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs ${
                          isActive
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700"
                            : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                        }`}
                    >
                      <span className="truncate">{group.group_name}</span>
                      <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                        {group.group_category === "organizational"
                          ? "Org"
                          : "Project"}
                      </span>
                    </button>
                  );
                })
              ) : (
                <EmptyState
                  title="No groups yet"
                  description="Create your first chat group to start collaborating with colleagues."
                  action={
                    <button
                        type="button"
                        onClick={() => {
                          if (!createGroupSubmitting) {
                            setIsCreateGroupOpen(true);
                            setCreateGroupError(null);
                          }
                        }}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
                      >
                        Create a group
                      </button>
                  }
                />
              )}
            </div>
          </aside>

          <section className="flex-1 min-w-0 flex flex-col">
            {selectedGroup ? (
              <>
                <header className="mb-2 flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {selectedGroup.group_name}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {selectedGroup.group_category === "organizational"
                        ? "Organizational group"
                        : "Project group"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
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
                        className="inline-flex items-center rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Add members
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
                          setGroupMembers(
                            Array.isArray(list) ? list : [],
                          );
                        } catch (e) {
                          console.error("Failed to load group members", e);
                          setMembersError(
                            "Could not load members. You may not have access to this group.",
                          );
                          setGroupMembers([]);
                        } finally {
                          setMembersLoading(false);
                        }
                      }}
                      className="inline-flex items-center rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Members
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedGroupId) {
                          void fetchMessages(selectedGroupId);
                        }
                      }}
                      className="inline-flex items-center rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Refresh
                    </button>
                  </div>
                </header>

                <div
                  ref={scrollContainerRef}
                  className="flex-1 min-h-0 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 space-y-3 dark:border-slate-700 dark:bg-slate-900/50"
                >
                  {messagesLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                        <p className="text-xs text-slate-500">
                          Loading messages…
                        </p>
                      </div>
                    </div>
                  ) : messagesError ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center space-y-2">
                        <p className="text-sm font-medium text-rose-600">
                          {messagesError}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedGroupId) {
                              void fetchMessages(selectedGroupId);
                            }
                          }}
                          className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  ) : hasMessages ? (
                    <>
                      {messages.map((message) => {
                        const isMine = message.sender_id === currentUserId;
                        const alignment = isMine
                          ? "justify-end"
                          : "justify-start";
                        const bubbleClasses = isMine
                          ? "bg-indigo-600 text-white rounded-2xl rounded-br-sm"
                          : "rounded-2xl rounded-bl-sm border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

                        return (
                          <div
                            key={message._id}
                            className={`flex ${alignment} gap-2`}
                          >
                            <div
                              className={`inline-flex max-w-[80%] flex-col px-3 py-2 text-sm shadow-sm ${bubbleClasses}`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
                                  {isMine
                                    ? "You"
                                    : message.sender_name || message.sender_id}
                                </span>
                                <span className="text-[10px] opacity-70">
                                  {new Date(
                                    message.created_at,
                                  ).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="whitespace-pre-wrap break-words text-xs leading-relaxed">
                                {message.content}
                              </p>
                            </div>
                            <div className="relative">
                                  <details className="group">
                                    <summary className="list-none cursor-pointer inline-flex items-center rounded-md border border-slate-300 px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50">
                                      Delete ▾
                                    </summary>

                                        <div className="absolute right-0 mt-1 w-32 rounded-md border border-slate-200 bg-white shadow-md z-10 text-xs 
dark:border-slate-700 dark:bg-slate-800">
                                          <button
                                            type="button"
                                            disabled={deleteBusyId === message._id}
                                            onClick={() =>
                                              void handleDeleteMessage(message._id, "me")
                                            }
                                            className="block w-full text-left px-2 py-1 text-slate-700 hover:bg-slate-100 
dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-60"
                                          >
                                            Delete for me
                                          </button>

                                          {message.sender_id === currentUserId && (
                                            <button
                                              type="button"
                                              disabled={deleteBusyId === message._id}
                                              onClick={() =>
                                                void handleDeleteMessage(message._id, "everyone")
                                              }
                                              className="block w-full text-left px-2 py-1 text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                                            >
                                              Delete for everyone
                                            </button>
                                          )}
                                        </div>
                                      </details>
                                    </div>
                          </div>
                        );
                      })}
                      <div ref={scrollAnchorRef} />
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center max-w-sm">
                        <p className="text-xs font-medium text-slate-500">
                          No messages yet.
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Start the conversation with a quick update or
                          question for the group.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <form
                  onSubmit={handleComposerSubmit}
                  className="mt-3 flex items-end gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="flex-1">
                    <label className="sr-only" htmlFor="chat-composer">
                      Message group
                    </label>
                    <textarea
                      id="chat-composer"
                      value={composerValue}
                      onChange={(event) =>
                        setComposerValue(event.target.value)
                      }
                      onKeyDown={handleComposerKeyDown}
                      rows={2}
                      className="block w-full resize-none border-0 bg-transparent px-0 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-slate-500"
                      placeholder="Type a message to the group…"
                      disabled={composerState === "sending"}
                    />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <button
                      type="submit"
                      disabled={
                        composerState === "sending" || !composerValue.trim()
                      }
                      className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {composerState === "sending" ? "Sending…" : "Send"}
                    </button>
                    <p className="text-[10px] text-slate-400">
                      Press Enter to send, Shift+Enter for a new line.
                    </p>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <EmptyState
                  title="Select or create a group"
                  description="Choose an existing group from the left, or create a new one to start collaborating."
                />
              </div>
            )}
          </section>
        </div>

        <Modal
          open={isCreateGroupOpen}
          onClose={() => {
            if (!createGroupSubmitting) {
              setIsCreateGroupOpen(false);
              setCreateGroupError(null);
            }
          }}
          title="Create chat group"
          description="Set up a focused space for ongoing collaboration."
          footer={
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!createGroupSubmitting) {
                    setIsCreateGroupOpen(false);
                    setCreateGroupError(null);
                  }
                }}
                className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                disabled={createGroupSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-chat-group-form"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={createGroupSubmitting}
              >
                {createGroupSubmitting ? "Creating…" : "Create group"}
              </button>
            </div>
          }
        >
          <form
            id="create-chat-group-form"
            onSubmit={handleCreateGroupSubmit}
            className="space-y-3"
          >
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Group name
              </label>
              <input
                type="text"
                value={createGroupPayload.group_name}
                onChange={(event) =>
                  setCreateGroupPayload((prev) => ({
                    ...prev,
                    group_name: event.target.value,
                  }))
                }
                className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
                placeholder="e.g. Engineering Standup, HR Announcements"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Group category
              </label>
              <select
                value={createGroupPayload.group_category}
                onChange={(event) =>
                  setCreateGroupPayload((prev) => ({
                    ...prev,
                    group_category: event.target.value as GroupCategory,
                  }))
                }
                className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                <option value="organizational">Organizational</option>
                <option value="project">Project</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-400">
                Organizational groups are typically created by admins, while
                project groups are suitable for cross-functional teams.
              </p>
            </div>

            {createGroupError && (
              <p className="text-xs text-rose-600">{createGroupError}</p>
            )}
          </form>
        </Modal>

        <Modal
          open={isMembersOpen}
          onClose={() => setIsMembersOpen(false)}
          title="Group members"
          description="People in this chat group."
          footer={
            <button
              type="button"
              onClick={() => setIsMembersOpen(false)}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Close
            </button>
          }
        >
          {membersLoading ? (
            <p className="text-xs text-slate-500">Loading…</p>
          ) : membersError ? (
            <p className="text-xs text-rose-600">{membersError}</p>
          ) : groupMembers.length === 0 ? (
            <p className="text-xs text-slate-500">No members found.</p>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto text-sm">
              {groupMembers.map((m) => (
                <li
                  key={m.user_id}
                  className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-2 py-1.5 dark:border-slate-600"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {m.name || m.email || m.user_id}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {m.username ? `@${m.username}` : m.email}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase text-slate-500">
                    {m.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Modal>

        <Modal
          open={isAddMemberOpen}
          onClose={() => {
            if (!addMemberSubmitting) {
              setIsAddMemberOpen(false);
              setAddMemberError(null);
            }
          }}
          title="Add member to group"
          description="Select a colleague from your company to add to this group."
          footer={
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!addMemberSubmitting) {
                    setIsAddMemberOpen(false);
                    setAddMemberError(null);
                  }
                }}
                className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                disabled={addMemberSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-member-form"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={addMemberSubmitting || !addMemberUserId}
              >
                {addMemberSubmitting ? "Adding…" : "Add member"}
              </button>
            </div>
          }
        >
          <form
            id="add-member-form"
            onSubmit={async (e: FormEvent) => {
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
            }}
            className="space-y-3"
          >
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Select user
              </label>
              <select
                value={addMemberUserId}
                onChange={(e) => setAddMemberUserId(e.target.value)}
                className="block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                <option value="">Choose a colleague…</option>
                {companyUsers
                  .filter((u) => u.user_id !== currentUserId)
                  .map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.display || u.name || u.email}
                    </option>
                  ))}
              </select>
            </div>
            {addMemberError && (
              <p className="text-xs text-rose-600">{addMemberError}</p>
            )}
          </form>
        </Modal>
      </Card>
    </div>
  );
}

