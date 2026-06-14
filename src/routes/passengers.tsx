import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { loadDraft, saveDraft, type BookingDraft, type Passenger } from "@/lib/booking";

export const Route = createFileRoute("/passengers")({
  head: () => ({ meta: [{ title: "Passenger details | Emirates" }] }),
  component: PassengersPage,
});

function blank(): Passenger {
  return { title: "Mr", firstName: "", lastName: "", dob: "", nationality: "", passport: "" };
}

function PassengersPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [pax, setPax] = useState<Passenger[]>([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const d = loadDraft();
    if (!d || d.selectedFlights.length === 0) { navigate({ to: "/" }); return; }
    setDraft(d);
    const n = d.criteria.adults + d.criteria.children + d.criteria.infants;
    setPax(Array.from({ length: n }, () => blank()));
  }, [navigate]);

  if (!draft) return null;

  const update = (i: number, patch: Partial<Passenger>) =>
    setPax((p) => p.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  const valid = email && phone && pax.every((p) => p.firstName && p.lastName && p.dob && p.passport && p.nationality);

  const next = () => {
    saveDraft({ ...draft, passengers: pax, contactEmail: email, contactPhone: phone });
    navigate({ to: "/payment" });
  };

  const labelFor = (i: number) => {
    if (i < draft.criteria.adults) return `Adult ${i + 1}`;
    const ci = i - draft.criteria.adults;
    if (ci < draft.criteria.children) return `Child ${ci + 1}`;
    return `Infant ${ci - draft.criteria.children + 1}`;
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link to="/search" className="text-sm text-emirates hover:underline">← Back to flights</Link>
        <h1 className="mt-2 text-3xl">Passenger details</h1>
        <p className="text-sm text-muted-foreground">
          Names must match passport or government-issued ID exactly.
        </p>

        <div className="mt-6 space-y-6">
          {pax.map((p, i) => (
            <div key={i} className="rounded-md border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">{labelFor(i)}</h2>
              <div className="grid gap-4 md:grid-cols-6">
                <Field label="Title" className="md:col-span-1">
                  <select value={p.title} onChange={(e) => update(i, { title: e.target.value })} className="input">
                    <option>Mr</option><option>Mrs</option><option>Ms</option><option>Miss</option><option>Dr</option>
                  </select>
                </Field>
                <Field label="First name" className="md:col-span-2">
                  <input value={p.firstName} onChange={(e) => update(i, { firstName: e.target.value })} className="input" />
                </Field>
                <Field label="Last name" className="md:col-span-3">
                  <input value={p.lastName} onChange={(e) => update(i, { lastName: e.target.value })} className="input" />
                </Field>
                <Field label="Date of birth" className="md:col-span-2">
                  <input type="date" value={p.dob} onChange={(e) => update(i, { dob: e.target.value })} className="input" />
                </Field>
                <Field label="Nationality" className="md:col-span-2">
                  <input value={p.nationality} onChange={(e) => update(i, { nationality: e.target.value })} placeholder="e.g. Nigerian" className="input" />
                </Field>
                <Field label="Passport number" className="md:col-span-2">
                  <input value={p.passport} onChange={(e) => update(i, { passport: e.target.value })} className="input" />
                </Field>
              </div>
            </div>
          ))}

          <div className="rounded-md border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Contact details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" /></Field>
              <Field label="Phone"><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" /></Field>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-semibold text-emirates">US$ {draft.totalPrice.toLocaleString()}</div>
          </div>
          <button
            onClick={next}
            disabled={!valid}
            className="rounded-md bg-emirates px-8 py-3 font-semibold text-emirates-foreground hover:bg-emirates-dark disabled:opacity-50"
          >
            Continue to payment
          </button>
        </div>
      </div>

      <style>{`.input { height: 2.75rem; width: 100%; border-radius: 0.375rem; border: 1px solid var(--color-border); background: var(--color-background); padding: 0 0.75rem; font-size: 0.875rem; }`}</style>
      <SiteFooter />
    </div>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
