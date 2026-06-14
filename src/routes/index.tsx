import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRightLeft, Calendar, Plus, Trash2, Users } from "lucide-react";
import heroImage from "@/assets/hero-plane.jpg";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AIRPORTS, type CabinClass, type Leg, type TripType, saveDraft, generateFlights } from "@/lib/booking";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Emirates | Book flights to Dubai and 140+ destinations" },
      { name: "description", content: "Book Emirates flights — return, one-way and multi-city itineraries to over 140 destinations worldwide." },
      { property: "og:title", content: "Emirates | Fly Better" },
      { property: "og:description", content: "Book your next Emirates flight." },
    ],
  }),
  component: Home,
});

function todayPlus(days: number) {
  const d = new Date(); d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function Home() {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState<TripType>("return");
  const [legs, setLegs] = useState<Leg[]>([
    { from: "LOS", to: "DXB", date: todayPlus(14) },
  ]);
  const [returnDate, setReturnDate] = useState(todayPlus(21));
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabin, setCabin] = useState<CabinClass>("economy");
  const [paxOpen, setPaxOpen] = useState(false);

  const updateLeg = (i: number, patch: Partial<Leg>) =>
    setLegs((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const swap = (i: number) =>
    setLegs((ls) => ls.map((l, idx) => (idx === i ? { ...l, from: l.to, to: l.from } : l)));

  const addLeg = () =>
    setLegs((ls) => [...ls, { from: ls[ls.length - 1].to, to: "", date: todayPlus(28) }]);

  const removeLeg = (i: number) =>
    setLegs((ls) => ls.filter((_, idx) => idx !== i));

  const onSearch = () => {
    const first = legs[0];
    if (!first.from || !first.to) return;
    const flights = generateFlights(first.from, first.to, first.date);
    saveDraft({
      criteria: { tripType, legs, returnDate: tripType === "return" ? returnDate : undefined, adults, children, infants, cabin },
      selectedFlights: [],
      totalPrice: 0,
    });
    void flights;
    navigate({ to: "/search" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <img src={heroImage} alt="Emirates aircraft above desert at sunset" className="h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-12 pb-8 md:pt-20 md:pb-16">
          <div className="max-w-xl text-white">
            <p className="text-sm uppercase tracking-wider opacity-90">Fly Emirates</p>
            <h1 className="mt-2 text-4xl md:text-6xl">Plan and book your next journey</h1>
            <p className="mt-4 text-base opacity-90 md:text-lg">
              Premium service to over 140 destinations across six continents.
            </p>
          </div>

          {/* Booking form */}
          <div className="mt-8 overflow-hidden rounded-md bg-card shadow-2xl">
            <div className="flex border-b">
              {(["return", "oneway", "multicity"] as TripType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTripType(t);
                    if (t !== "multicity") setLegs([legs[0]]);
                  }}
                  className={`px-5 py-3 text-sm font-medium ${
                    tripType === t
                      ? "border-b-2 border-emirates text-emirates"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "return" ? "Return" : t === "oneway" ? "One way" : "Multi-city"}
                </button>
              ))}
            </div>

            <div className="space-y-4 p-4 md:p-6">
              {legs.map((leg, i) => (
                <div key={i} className="grid items-end gap-3 md:grid-cols-[1fr_auto_1fr_1fr_auto]">
                  <AirportSelect
                    label={`From${tripType === "multicity" ? ` (Leg ${i + 1})` : ""}`}
                    value={leg.from}
                    onChange={(v) => updateLeg(i, { from: v })}
                  />
                  <button
                    type="button"
                    onClick={() => swap(i)}
                    className="mb-2 hidden h-10 w-10 items-center justify-center rounded-full border bg-background hover:bg-muted md:flex"
                    aria-label="Swap origin and destination"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                  </button>
                  <AirportSelect
                    label="To"
                    value={leg.to}
                    onChange={(v) => updateLeg(i, { to: v })}
                  />
                  <DateField
                    label={i === 0 && tripType === "return" ? "Departing" : "Date"}
                    value={leg.date}
                    onChange={(v) => updateLeg(i, { date: v })}
                  />
                  {tripType === "multicity" && legs.length > 1 ? (
                    <button onClick={() => removeLeg(i)} className="mb-2 h-10 w-10 rounded-md border text-muted-foreground hover:bg-muted">
                      <Trash2 className="mx-auto h-4 w-4" />
                    </button>
                  ) : <div className="hidden md:block" />}
                </div>
              ))}

              {tripType === "return" && (
                <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                  <div className="md:col-start-4">
                    <DateField label="Returning" value={returnDate} onChange={setReturnDate} />
                  </div>
                </div>
              )}

              {tripType === "multicity" && legs.length < 5 && (
                <button onClick={addLeg} className="inline-flex items-center gap-2 text-sm text-emirates hover:underline">
                  <Plus className="h-4 w-4" /> Add another flight
                </button>
              )}

              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <div className="relative">
                  <Label>Passengers</Label>
                  <button
                    type="button"
                    onClick={() => setPaxOpen((o) => !o)}
                    className="flex h-11 w-full items-center gap-2 rounded-md border bg-background px-3 text-left text-sm"
                  >
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {adults} Adult{adults > 1 ? "s" : ""}{children ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""}{infants ? `, ${infants} Infant${infants > 1 ? "s" : ""}` : ""}
                  </button>
                  {paxOpen && (
                    <div className="absolute z-20 mt-1 w-full space-y-2 rounded-md border bg-popover p-3 shadow-lg">
                      <Stepper label="Adults (12+)" value={adults} onChange={(n) => setAdults(Math.max(1, n))} min={1} max={9} />
                      <Stepper label="Children (2-11)" value={children} onChange={(n) => setChildren(Math.max(0, n))} min={0} max={8} />
                      <Stepper label="Infants (under 2)" value={infants} onChange={(n) => setInfants(Math.max(0, n))} min={0} max={adults} />
                      <button onClick={() => setPaxOpen(false)} className="mt-2 w-full rounded-md bg-emirates py-2 text-sm text-emirates-foreground">Done</button>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Cabin</Label>
                  <select
                    value={cabin}
                    onChange={(e) => setCabin(e.target.value as CabinClass)}
                    className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="economy">Economy Class</option>
                    <option value="premium">Premium Economy</option>
                    <option value="business">Business Class</option>
                    <option value="first">First Class</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={onSearch}
                    className="h-11 w-full rounded-md bg-emirates px-8 text-sm font-semibold text-emirates-foreground hover:bg-emirates-dark md:w-auto"
                  >
                    Search flights
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-3xl md:text-4xl">Discover our destinations</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { city: "Dubai", desc: "City of gold and innovation" },
            { city: "London", desc: "Timeless capital of culture" },
            { city: "New York", desc: "The city that never sleeps" },
          ].map((d) => (
            <div key={d.city} className="group overflow-hidden rounded-md border bg-card">
              <div className="aspect-[4/3] bg-gradient-to-br from-emirates/80 to-emirates-dark" />
              <div className="p-5">
                <h3 className="text-xl">{d.city}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{children}</label>;
}

function AirportSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-md border bg-background px-3 text-sm"
      >
        <option value="">Select airport</option>
        {AIRPORTS.map((a) => (
          <option key={a.code} value={a.code}>{a.city} ({a.code}) — {a.country}</option>
        ))}
      </select>
    </div>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
        />
      </div>
    </div>
  );
}

function Stepper({ label, value, onChange, min, max }: { label: string; value: number; onChange: (n: number) => void; min: number; max: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(value - 1)} disabled={value <= min} className="h-8 w-8 rounded-full border text-lg disabled:opacity-40">−</button>
        <span className="w-6 text-center text-sm">{value}</span>
        <button onClick={() => onChange(value + 1)} disabled={value >= max} className="h-8 w-8 rounded-full border text-lg disabled:opacity-40">+</button>
      </div>
    </div>
  );
}
