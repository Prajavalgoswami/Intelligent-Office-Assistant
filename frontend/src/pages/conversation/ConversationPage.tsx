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
  return `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function getAssistantBadge(type?: string) {
  if (!type) return null;
  if (type === "error") return <Badge variant="danger">Error</Badge>;
  if (type === "meeting_confirmation") return <Badge variant="success">Meeting confirmed</Badge>;
  if (type === "clarification") return <Badge variant="warning">Needs clarification</Badge>;
  return null;
}

function getAssistantBubbleClasses(type?: string): string {
  const base =
    "inline-flex max-w-[80%] flex-col rounded-2xl rounded-bl-sm px-4 py-3 text-sm shadow-sm transition-all duration-300";
  if (type === "error")
    return `${base} bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800/40`;
  if (type === "meeting_confirmation")
    return `${base} bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/40`;
  if (type === "clarification")
    return `${base} bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/40`;
  return `${base} bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60`;
}

function TypingIndicator() {
  return (
    <div className="flex justify-start animate-[fadeSlideIn_0.3s_ease-out]">
      <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500"
              style={{ animation: "typingDot 1.4s ease-in-out infinite", animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <span className="ml-1 text-[10px] text-slate-400 dark:text-slate-500">thinking…</span>
      </div>
    </div>
  );
}

const quickSuggestions = [
  "📅 Schedule a meeting",
  "📋 Show my tasks",
  "📧 Check my emails",
  "💬 Summarize my day",
];

export function ConversationPage() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  const hasMessages = useMemo(() => messages.length > 0, [messages]);

  useEffect(() => {
    if (scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  function handleScroll() {
    if (!scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!isNearBottom);
  }

  function scrollToBottom() {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const appendMessage = useCallback((partial: Omit<ConversationMessage, "id">) => {
    setMessages((prev) => [...prev, { id: createMessageId(), ...partial }]);
  }, []);

  async function handleSend(text?: string): Promise<void> {
    const trimmed = (text ?? input).trim();
    if (!trimmed || sending) return;
    setLastError(null);
    setInput("");
    appendMessage({ role: "user", content: trimmed, type: undefined });
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
      const errorMessage = "Sorry, I couldn't reach the assistant. Please try again in a moment.";
      setLastError(errorMessage);
      appendMessage({ role: "assistant", content: errorMessage, type: "error" });
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void handleSend();
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  return (
    <div className="h-[calc(100vh-9rem)]">
      <Card
        title="Conversation Assistant"
        description="Ask questions, schedule meetings, and get help with your work."
        className="h-full"
        fillHeight
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        }
        accentColor="indigo"
      >
        {/* ── Scrollable messages area ── */}
        <div className="relative flex-1 min-h-0">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="absolute inset-0 overflow-y-auto rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-slate-900/30 px-4 py-4 space-y-4 custom-scrollbar"
          >
            {/* Empty state */}
            {!hasMessages && (
              <div className="flex h-full items-center justify-center">
                <div className="text-center max-w-sm animate-[fadeSlideIn_0.5s_ease-out]">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30">
                    <svg className="h-8 w-8 text-indigo-500 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Start a conversation
                  </p>
                  <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                    Ask for help with meetings, tasks, or any workspace questions.
                  </p>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message) => {
              if (message.role === "user") {
                return (
                  <div key={message.id} className="flex justify-end animate-[slideInRight_0.3s_ease-out]">
                    <div className="inline-flex max-w-[80%] items-end gap-2">
                      <div className="rounded-2xl rounded-br-sm bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 text-sm text-white shadow-md">
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-[10px] font-bold text-white shadow-sm">
                        Y
                      </div>
                    </div>
                  </div>
                );
              }

              const badge = getAssistantBadge(message.type);
              const bubbleClasses = getAssistantBubbleClasses(message.type);

              return (
                <div key={message.id} className="flex justify-start animate-[fadeSlideInLeft_0.3s_ease-out]">
                  <div className="inline-flex max-w-[80%] items-end gap-2">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 shadow-sm">
                      <svg className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </div>
                    <div className={bubbleClasses}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Assistant
                        </span>
                        {badge}
                      </div>
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {sending && <TypingIndicator />}
            <div ref={scrollAnchorRef} />
          </div>

          {/* Scroll-to-bottom button */}
          {showScrollBtn && (
            <button
              type="button"
              onClick={scrollToBottom}
              className="absolute bottom-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all animate-[scaleIn_0.2s_ease-out]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Quick suggestions (only when empty) ── */}
        {!hasMessages && (
          <div className="pt-3 flex flex-wrap gap-2 flex-shrink-0 animate-[fadeSlideIn_0.5s_ease-out_0.3s_both]">
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => void handleSend(suggestion)}
                disabled={sending}
                className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-800/60 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* ── Composer ── */}
        <form
          onSubmit={handleSubmit}
          className="mt-3 flex-shrink-0 flex items-end gap-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-800/60 px-4 py-3 shadow-sm"
        >
          <div className="flex-1">
            <label className="sr-only" htmlFor="conversation-input">
              Message the assistant
            </label>
            <textarea
              id="conversation-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              rows={2}
              className="block w-full resize-none border-0 bg-transparent px-0 py-1.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0"
              placeholder="Ask a question, or type what you need help with…"
              disabled={sending}
            />
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <button
              type="submit"
              id="conversation-send-btn"
              disabled={sending || !input.trim()}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {sending ? (
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
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Enter · Shift+Enter ↵
            </p>
          </div>
        </form>

        {lastError && (
          <p className="mt-2 flex-shrink-0 text-[11px] text-rose-500 dark:text-rose-400">{lastError}</p>
        )}
      </Card>
    </div>
  );
}
