// Shared booking types + sessionStorage helpers for the booking flow.

export type TripType = "return" | "oneway" | "multicity";
export type CabinClass = "economy" | "premium" | "business" | "first";

export interface Leg {
  from: string;
  to: string;
  date: string;
}

export interface SearchCriteria {
  tripType: TripType;
  legs: Leg[];
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabin: CabinClass;
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  depart: string; // ISO
  arrive: string; // ISO
  durationMins: number;
  stops: number;
  aircraft: string;
  price: number;
}

export interface Passenger {
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  nationality: string;
  passport: string;
  email?: string;
  phone?: string;
}

export interface BookingDraft {
  criteria: SearchCriteria;
  selectedFlights: Flight[];
  passengers?: Passenger[];
  contactEmail?: string;
  contactPhone?: string;
  totalPrice: number;
}

const KEY = "ek_booking_draft";

export const saveDraft = (d: BookingDraft) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(d));
};

export const loadDraft = (): BookingDraft | null => {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as BookingDraft; } catch { return null; }
};

export const clearDraft = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
};

export const AIRPORTS: { code: string; city: string; country: string }[] = [
  { code: "DXB", city: "Dubai", country: "United Arab Emirates" },
  { code: "LOS", city: "Lagos", country: "Nigeria" },
  { code: "ABV", city: "Abuja", country: "Nigeria" },
  { code: "LHR", city: "London Heathrow", country: "United Kingdom" },
  { code: "JFK", city: "New York JFK", country: "United States" },
  { code: "LAX", city: "Los Angeles", country: "United States" },
  { code: "CDG", city: "Paris", country: "France" },
  { code: "FRA", city: "Frankfurt", country: "Germany" },
  { code: "SIN", city: "Singapore", country: "Singapore" },
  { code: "SYD", city: "Sydney", country: "Australia" },
  { code: "JNB", city: "Johannesburg", country: "South Africa" },
  { code: "NBO", city: "Nairobi", country: "Kenya" },
  { code: "CAI", city: "Cairo", country: "Egypt" },
  { code: "IST", city: "Istanbul", country: "Turkey" },
  { code: "BOM", city: "Mumbai", country: "India" },
  { code: "DEL", city: "Delhi", country: "India" },
  { code: "BKK", city: "Bangkok", country: "Thailand" },
  { code: "HKG", city: "Hong Kong", country: "Hong Kong" },
  { code: "MAD", city: "Madrid", country: "Spain" },
  { code: "AMS", city: "Amsterdam", country: "Netherlands" },
];

export const airportLabel = (code: string) => {
  const a = AIRPORTS.find((x) => x.code === code.toUpperCase());
  return a ? `${a.city} (${a.code})` : code;
};

// Deterministic flight generator (mock).
export function generateFlights(from: string, to: string, date: string): Flight[] {
  const seed = [...(from + to + date)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (n: number) => ((seed * (n + 7) * 9301 + 49297) % 233280) / 233280;
  const baseTimes = [6.5, 9, 12.25, 15.5, 18.75, 22];
  const aircrafts = ["Boeing 777-300ER", "Airbus A380-800", "Boeing 777-200LR", "Airbus A350-900"];
  return baseTimes.map((h, i) => {
    const dep = new Date(date);
    dep.setHours(Math.floor(h), Math.round((h % 1) * 60), 0, 0);
    const dur = 240 + Math.floor(rng(i) * 600); // 4-14h
    const arr = new Date(dep.getTime() + dur * 60_000);
    const stops = rng(i + 2) > 0.7 ? 1 : 0;
    const base = 420 + Math.floor(rng(i + 5) * 1800);
    return {
      id: `EK${100 + i}-${date}`,
      airline: "Emirates",
      flightNumber: `EK ${100 + i * 7}`,
      from, to,
      depart: dep.toISOString(),
      arrive: arr.toISOString(),
      durationMins: dur,
      stops,
      aircraft: aircrafts[i % aircrafts.length],
      price: base,
    };
  });
}

export const fmtDuration = (mins: number) => `${Math.floor(mins / 60)}h ${mins % 60}m`;
export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
export const fmtMoney = (n: number) => `US$ ${n.toLocaleString()}`;
