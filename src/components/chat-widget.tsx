import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Msg { id: string; sender: "customer" | "admin"; content: string; created_at: string }

interface Props {
  conversationId: string | null;
  open: boolean;
  onClose: () => void;
  paymentMethod: string;
}

export function ChatWidget({ conversationId, open, onClose, paymentMethod }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId) return;
    let cancel = false;
    (async () => {
      const { data } = await supabase
        .from("messages").select("*")
        .eq("conversation_id", conversationId).order("created_at");
      if (!cancel && data) setMessages(data as Msg[]);
    })();
    const channel = supabase
      .channel(`msgs-${conversationId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => setMessages((m) => [...m, payload.new as Msg]))
      .subscribe();
    return () => { cancel = true; supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || !conversationId) return;
    setText("");
    await supabase.from("messages").insert({
      conversation_id: conversationId, sender: "customer", content: trimmed,
    });
    await supabase.from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);
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
        {messages.length === 0 && (
          <div className="rounded-md bg-white p-3 text-sm text-neutral-600">
            An agent will be with you shortly to confirm your payment details.
          </div>
        )}
        {messages.map((m) => (
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
