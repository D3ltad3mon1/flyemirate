import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plane, Clock, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  airportLabel, fmtDate, fmtDuration, fmtMoney, fmtTime,
  generateFlights, loadDraft, saveDraft, type Flight, type BookingDraft,
} from "@/lib/booking";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Flight results | Emirates" }] }),
  component: SearchPage,
});

function SearchPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [selected, setSelected] = useState<Record<number, Flight>>({});

  useEffect(() => {
    const d = loadDraft();
    if (!d) { navigate({ to: "/" }); return; }
    setDraft(d);
  }, [navigate]);

  const segments = useMemo(() => {
    if (!draft) return [];
    const segs = draft.criteria.legs.map((l) => ({ from: l.from, to: l.to, date: l.date, label: "Outbound" }));
    if (draft.criteria.tripType === "return" && draft.criteria.returnDate) {
      const out = draft.criteria.legs[0];
      segs.push({ from: out.to, to: out.from, date: draft.criteria.returnDate, label: "Return" });
    }
    return segs;
  }, [draft]);

  if (!draft) return null;

  const allSelected = segments.every((_, i) => selected[i]);
  const totalPrice = Object.values(selected).reduce((s, f) => s + f.price, 0) *
    (draft.criteria.adults + draft.criteria.children * 0.75);

  const proceed = () => {
    saveDraft({
      ...draft,
      selectedFlights: segments.map((_, i) => selected[i]),
      totalPrice: Math.round(totalPrice),
    });
    navigate({ to: "/passengers" });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link to="/" className="text-sm text-emirates hover:underline">← Modify search</Link>
        <h1 className="mt-2 text-3xl">Select your flights</h1>
        <p className="text-sm text-muted-foreground">
          {draft.criteria.adults} adult{draft.criteria.adults > 1 ? "s" : ""} • {draft.criteria.cabin}
        </p>

        <div className="mt-8 space-y-10">
          {segments.map((seg, idx) => {
            const flights = generateFlights(seg.from, seg.to, seg.date);
            return (
              <section key={idx}>
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 className="text-xl">
                    {seg.label}: {airportLabel(seg.from)} <ArrowRight className="inline h-4 w-4" /> {airportLabel(seg.to)}
                  </h2>
                  <span className="text-sm text-muted-foreground">{fmtDate(seg.date)}</span>
                </div>
                <div className="space-y-3">
                  {flights.map((f) => {
                    const isSelected = selected[idx]?.id === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setSelected((s) => ({ ...s, [idx]: f }))}
                        className={`flex w-full items-center gap-4 rounded-md border-2 bg-card p-4 text-left transition ${
                          isSelected ? "border-emirates ring-2 ring-emirates/20" : "border-transparent hover:border-border"
                        }`}
                      >
                        <div className="hidden h-12 w-12 items-center justify-center rounded-full bg-emirates/10 text-emirates md:flex">
                          <Plane className="h-5 w-5" />
                        </div>
                        <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-5">
                          <div>
                            <div className="text-xl font-semibold">{fmtTime(f.depart)}</div>
                            <div className="text-xs text-muted-foreground">{f.from}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {fmtDuration(f.durationMins)}</div>
                            <div>{f.stops === 0 ? "Direct" : `${f.stops} stop`}</div>
                          </div>
                          <div>
                            <div className="text-xl font-semibold">{fmtTime(f.arrive)}</div>
                            <div className="text-xs text-muted-foreground">{f.to}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <div>{f.flightNumber}</div>
                            <div>{f.aircraft}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-emirates">{fmtMoney(f.price)}</div>
                            <div className="text-xs text-muted-foreground">per adult</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="sticky bottom-0 mt-10 -mx-4 border-t bg-card px-4 py-4 shadow-lg md:rounded-md md:mx-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total estimate</div>
              <div className="text-2xl font-semibold text-emirates">{fmtMoney(Math.round(totalPrice))}</div>
            </div>
            <button
              onClick={proceed}
              disabled={!allSelected}
              className="rounded-md bg-emirates px-8 py-3 font-semibold text-emirates-foreground hover:bg-emirates-dark disabled:opacity-50"
            >
              Continue to passenger details
            </button>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
