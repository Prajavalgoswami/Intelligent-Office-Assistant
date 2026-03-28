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
import { Badge } from "../../components/ui/Badge";
import {
  sendConversationMessage,
  type ConversationMessageResponse,
} from "../../api/conversation.api";

type ConversationRole = "user" | "assistant";

export interface ConversationMessage {
  id: string;
  role: ConversationRole;
  content: string;
  type?: string;
}

function createMessageId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function getAssistantBadge(type?: string) {
  if (!type) return null;

  if (type === "error") {
    return <Badge variant="danger">Error</Badge>;
  }

  if (type === "meeting_confirmation") {
    return <Badge variant="success">Meeting confirmed</Badge>;
  }

  if (type === "clarification") {
    return <Badge variant="warning">Needs clarification</Badge>;
  }

  return null;
}

function getAssistantBubbleClasses(type?: string): string {
  const base =
    "inline-flex max-w-[80%] flex-col rounded-2xl px-3 py-2 text-sm shadow-sm";

  if (type === "error") {
    return `${base} bg-rose-50 text-rose-800 border border-rose-200`;
  }

  if (type === "meeting_confirmation") {
    return `${base} bg-emerald-50 text-emerald-900 border border-emerald-200`;
  }

  if (type === "clarification") {
    return `${base} bg-amber-50 text-amber-900 border border-amber-200`;
  }

  return `${base} bg-white text-slate-900 border border-slate-200`;
}

export function ConversationPage() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  const hasMessages = useMemo(() => messages.length > 0, [messages]);

  useEffect(() => {
    if (scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  const appendMessage = useCallback(
    (partial: Omit<ConversationMessage, "id">) => {
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          ...partial,
        },
      ]);
    },
    [],
  );

  async function handleSend(): Promise<void> {
    const trimmed = input.trim();
    if (!trimmed || sending) {
      return;
    }

    setLastError(null);
    setInput("");

    appendMessage({
      role: "user",
      content: trimmed,
      type: undefined,
    });

    setSending(true);

    try {
      const response = await sendConversationMessage(trimmed);
      const payload: ConversationMessageResponse | undefined = response.data;

      appendMessage({
        role: "assistant",
        content: payload?.response?.trim() || "The assistant did not return a response.",
        type: payload?.type,
      });
    } catch (error) {
      console.error("Failed to send conversation message", error);
      const errorMessage =
        "Sorry, I couldn't reach the assistant. Please try again in a moment.";
      setLastError(errorMessage);

      appendMessage({
        role: "assistant",
        content: errorMessage,
        type: "error",
      });
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void handleSend();
  }

  function handleInputKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  return (
    <div className="space-y-4">
      <Card
        title="Conversation Assistant"
        description="Ask questions, schedule meetings, and get help with your day-to-day work."
        className="h-[calc(100vh-9rem)] flex flex-col"
      >
        <div className="flex-1 min-h-0 flex flex-col">
          <div
            ref={scrollContainerRef}
            className="flex-1 min-h-0 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 space-y-3 dark:border-slate-700 dark:bg-slate-900/50"
          >
            {!hasMessages && (
              <div className="flex h-full items-center justify-center">
                <div className="text-center max-w-sm">
                  <p className="text-xs font-medium text-slate-500">
                    Start a conversation with your intelligent assistant.
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Ask for help with meetings, tasks, or any workspace
                    questions. Your messages stay within this workspace.
                  </p>
                </div>
              </div>
            )}

            {messages.map((message) => {
              if (message.role === "user") {
                return (
                  <div key={message.id} className="flex justify-end">
                    <div className="inline-flex max-w-[80%] rounded-2xl rounded-br-sm bg-indigo-600 px-3 py-2 text-sm text-white shadow-sm">
                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                  </div>
                );
              }

              const badge = getAssistantBadge(message.type);
              const bubbleClasses = getAssistantBubbleClasses(message.type);

              return (
                <div key={message.id} className="flex justify-start">
                  <div className={bubbleClasses}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Assistant
                      </span>
                      {badge}
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              );
            })}

            <div ref={scrollAnchorRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-3 flex items-end gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex-1">
              <label className="sr-only" htmlFor="conversation-input">
                Message the assistant
              </label>
              <textarea
                id="conversation-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                rows={2}
                className="block w-full resize-none border-0 bg-transparent px-0 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-slate-500"
                placeholder="Ask a question, or type what you need help with…"
                disabled={sending}
              />
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                    Sending…
                  </span>
                ) : (
                  "Send"
                )}
              </button>
              <p className="text-[10px] text-slate-400">
                Press Enter to send, Shift+Enter for a new line.
              </p>
            </div>
          </form>

          {lastError && (
            <p className="mt-2 text-[11px] text-rose-600">{lastError}</p>
          )}
        </div>
      </Card>
    </div>
  );
}

