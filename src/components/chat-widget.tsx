import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import {
  fetchChatMessages,
  sendChatMessage,
  type ChatMessage,
} from "@/lib/chat";

// Live updates poll the token-gated function every few seconds while the
// widget is open. Supabase Realtime is not used here: it needs a SELECT
// policy on the messages table, which the lockdown removes, and a customer
// must only ever see their own chat — the access token enforces that.

const POLL_MS = 3000;

interface Props {
  conversationId: string | null;
  accessToken: string | null;
  greeting?: string | null;
  open: boolean;
  onClose: () => void;
  paymentMethod: string;
}

export function ChatWidget({ conversationId, accessToken, greeting, open, onClose, paymentMethod }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // The welcome line is a local message only — customers cannot insert
  // "admin" messages into the database, so it never leaves this browser.
  const displayMessages = useMemo(() => {
    if (!greeting) return messages;
    return [
      { id: "local-greeting", sender: "admin", content: greeting, created_at: new Date().toISOString() } as ChatMessage,
      ...messages,
    ];
  }, [greeting, messages]);

  useEffect(() => {
    if (!conversationId || !accessToken || !open) return;
    let cancel = false;
    const load = async () => {
      try {
        const data = await fetchChatMessages(conversationId, accessToken);
        if (!cancel) setMessages(data);
      } catch {
        // Bad or expired token, or a transient failure: leave what is shown
        // and let the next poll retry. Never crash the widget.
      }
    };
    load();
    const timer = setInterval(load, POLL_MS);
    return () => { cancel = true; clearInterval(timer); };
  }, [conversationId, accessToken, open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [displayMessages, open]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || !conversationId || !accessToken) return;
    setText("");
    try {
      await sendChatMessage(conversationId, accessToken, trimmed);
      const data = await fetchChatMessages(conversationId, accessToken);
      setMessages(data);
    } catch {
      alert("Message could not be sent. Please try again.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex h-[520px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border bg-card shadow-2xl">
      <div className="flex items-center justify-between bg-emirates px-4 py-3 text-emirates-foreground">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <div>
            <div className="text-sm font-semibold">Emirates Support</div>
            <div className="text-xs opacity-80">{paymentMethod} • we're online</div>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close chat"><X className="h-5 w-5" /></button>
      </div>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 px-3 py-4">
        {displayMessages.length === 0 && (
          <div className="rounded-md bg-white p-3 text-sm text-neutral-600">
            An agent will be with you shortly to confirm your payment details.
          </div>
        )}
        {displayMessages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === "customer" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
              m.sender === "customer" ? "bg-emirates text-emirates-foreground" : "bg-white text-foreground border"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t bg-card p-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emirates"
        />
        <button onClick={send} className="rounded-md bg-emirates p-2 text-emirates-foreground hover:bg-emirates-dark">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
