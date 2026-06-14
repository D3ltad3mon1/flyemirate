import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin-portal-x7k9")({
  head: () => ({ meta: [{ title: "Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminPage,
});

interface Conversation {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  payment_method: string;
  status: string;
  last_message_at: string;
  created_at: string;
  booking_details: { totalPrice?: number; flights?: { no: string; from: string; to: string }[] } | null;
}

interface Message { id: string; conversation_id: string; sender: "customer" | "admin"; content: string; created_at: string }

function AdminPage() {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load + subscribe to conversations
  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data } = await supabase
        .from("conversations").select("*").order("last_message_at", { ascending: false });
      if (!cancel && data) setConvos(data as Conversation[]);
    })();
    const channel = supabase
      .channel("admin-convos")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, async () => {
        const { data } = await supabase
          .from("conversations").select("*").order("last_message_at", { ascending: false });
        if (data) setConvos(data as Conversation[]);
      })
      .subscribe();
    return () => { cancel = true; supabase.removeChannel(channel); };
  }, []);

  // Load + subscribe to messages for active conversation
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    let cancel = false;
    (async () => {
      const { data } = await supabase
        .from("messages").select("*").eq("conversation_id", activeId).order("created_at");
      if (!cancel && data) setMessages(data as Message[]);
    })();
    const channel = supabase
      .channel(`admin-msgs-${activeId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeId}` },
        (p) => setMessages((m) => [...m, p.new as Message]))
      .subscribe();
    return () => { cancel = true; supabase.removeChannel(channel); };
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const t = text.trim();
    if (!t || !activeId) return;
    setText("");
    await supabase.from("messages").insert({ conversation_id: activeId, sender: "admin", content: t });
    await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", activeId);
  };

  const active = convos.find((c) => c.id === activeId) ?? null;

  return (
    <div className="flex h-screen flex-col bg-neutral-900 text-neutral-100">
      <header className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-amber-400" />
          <span className="font-semibold">Admin · Live Chats</span>
        </div>
        <span className="text-xs text-neutral-500">{convos.length} conversation{convos.length === 1 ? "" : "s"}</span>
      </header>

      <div className="grid flex-1 grid-cols-[320px_1fr] overflow-hidden">
        {/* Sidebar */}
        <aside className="overflow-y-auto border-r border-neutral-800">
          {convos.length === 0 && <div className="p-4 text-sm text-neutral-500">No conversations yet.</div>}
          {convos.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full border-b border-neutral-800 px-4 py-3 text-left hover:bg-neutral-800 ${activeId === c.id ? "bg-neutral-800" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{c.customer_name ?? "Anonymous"}</span>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] uppercase text-amber-300">
                  {c.payment_method}
                </span>
              </div>
              <div className="mt-1 truncate text-xs text-neutral-400">{c.customer_email ?? "—"}</div>
              <div className="mt-1 text-[11px] text-neutral-500">
                {new Date(c.last_message_at).toLocaleString()}
              </div>
            </button>
          ))}
        </aside>

        {/* Chat panel */}
        <section className="flex flex-col overflow-hidden">
          {!active && (
            <div className="m-auto text-sm text-neutral-500">Select a conversation to start replying.</div>
          )}
          {active && (
            <>
              <div className="border-b border-neutral-800 bg-neutral-950 px-5 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{active.customer_name ?? "Anonymous"}</div>
                    <div className="text-xs text-neutral-400">{active.customer_email ?? "no email"} · {active.payment_method}</div>
                  </div>
                  {active.booking_details?.totalPrice && (
                    <div className="text-right">
                      <div className="text-xs text-neutral-400">Booking total</div>
                      <div className="text-lg font-semibold text-amber-300">US$ {active.booking_details.totalPrice.toLocaleString()}</div>
                    </div>
                  )}
                </div>
                {active.booking_details?.flights && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-400">
                    {active.booking_details.flights.map((f, i) => (
                      <span key={i} className="rounded bg-neutral-800 px-2 py-1">{f.no}: {f.from}→{f.to}</span>
                    ))}
                  </div>
                )}
              </div>

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-neutral-900 p-5">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                      m.sender === "admin" ? "bg-amber-500 text-neutral-900" : "bg-neutral-800 text-neutral-100"
                    }`}>
                      <div>{m.content}</div>
                      <div className={`mt-1 text-[10px] ${m.sender === "admin" ? "text-neutral-800/70" : "text-neutral-400"}`}>
                        {new Date(m.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 border-t border-neutral-800 bg-neutral-950 p-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Reply as admin..."
                  className="flex-1 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-amber-400"
                />
                <button onClick={send} className="rounded-md bg-amber-500 p-2 text-neutral-900 hover:bg-amber-400">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
