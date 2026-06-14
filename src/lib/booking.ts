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

export const AIRPORTS: { code: string; city: string; country: string; name?: string }[] = [
  // Africa
  { code: "LOS", city: "Lagos", country: "Nigeria", name: "Murtala Muhammed International" },
  { code: "ABV", city: "Abuja", country: "Nigeria", name: "Nnamdi Azikiwe International" },
  { code: "PHC", city: "Port Harcourt", country: "Nigeria", name: "Port Harcourt International" },
  { code: "KAN", city: "Kano", country: "Nigeria", name: "Mallam Aminu Kano International" },
  { code: "ACC", city: "Accra", country: "Ghana", name: "Kotoka International" },
  { code: "ABJ", city: "Abidjan", country: "Côte d'Ivoire", name: "Félix-Houphouët-Boigny" },
  { code: "DKR", city: "Dakar", country: "Senegal", name: "Blaise Diagne International" },
  { code: "NBO", city: "Nairobi", country: "Kenya", name: "Jomo Kenyatta International" },
  { code: "ADD", city: "Addis Ababa", country: "Ethiopia", name: "Bole International" },
  { code: "DAR", city: "Dar es Salaam", country: "Tanzania", name: "Julius Nyerere International" },
  { code: "EBB", city: "Entebbe", country: "Uganda", name: "Entebbe International" },
  { code: "KGL", city: "Kigali", country: "Rwanda", name: "Kigali International" },
  { code: "JNB", city: "Johannesburg", country: "South Africa", name: "O. R. Tambo International" },
  { code: "CPT", city: "Cape Town", country: "South Africa", name: "Cape Town International" },
  { code: "DUR", city: "Durban", country: "South Africa", name: "King Shaka International" },
  { code: "HRE", city: "Harare", country: "Zimbabwe", name: "Robert Gabriel Mugabe International" },
  { code: "LUN", city: "Lusaka", country: "Zambia", name: "Kenneth Kaunda International" },
  { code: "MPM", city: "Maputo", country: "Mozambique", name: "Maputo International" },
  { code: "CAI", city: "Cairo", country: "Egypt", name: "Cairo International" },
  { code: "CMN", city: "Casablanca", country: "Morocco", name: "Mohammed V International" },
  { code: "RAK", city: "Marrakesh", country: "Morocco", name: "Marrakesh Menara" },
  { code: "TUN", city: "Tunis", country: "Tunisia", name: "Tunis-Carthage International" },
  { code: "ALG", city: "Algiers", country: "Algeria", name: "Houari Boumediene" },

  // Middle East
  { code: "DXB", city: "Dubai", country: "United Arab Emirates", name: "Dubai International" },
  { code: "DWC", city: "Dubai", country: "United Arab Emirates", name: "Al Maktoum International" },
  { code: "AUH", city: "Abu Dhabi", country: "United Arab Emirates", name: "Zayed International" },
  { code: "SHJ", city: "Sharjah", country: "United Arab Emirates", name: "Sharjah International" },
  { code: "DOH", city: "Doha", country: "Qatar", name: "Hamad International" },
  { code: "RUH", city: "Riyadh", country: "Saudi Arabia", name: "King Khalid International" },
  { code: "JED", city: "Jeddah", country: "Saudi Arabia", name: "King Abdulaziz International" },
  { code: "DMM", city: "Dammam", country: "Saudi Arabia", name: "King Fahd International" },
  { code: "MED", city: "Medina", country: "Saudi Arabia", name: "Prince Mohammad bin Abdulaziz" },
  { code: "KWI", city: "Kuwait City", country: "Kuwait", name: "Kuwait International" },
  { code: "BAH", city: "Manama", country: "Bahrain", name: "Bahrain International" },
  { code: "MCT", city: "Muscat", country: "Oman", name: "Muscat International" },
  { code: "AMM", city: "Amman", country: "Jordan", name: "Queen Alia International" },
  { code: "BEY", city: "Beirut", country: "Lebanon", name: "Rafic Hariri International" },
  { code: "TLV", city: "Tel Aviv", country: "Israel", name: "Ben Gurion" },
  { code: "BGW", city: "Baghdad", country: "Iraq", name: "Baghdad International" },
  { code: "IKA", city: "Tehran", country: "Iran", name: "Imam Khomeini International" },

  // Europe
  { code: "LHR", city: "London", country: "United Kingdom", name: "Heathrow" },
  { code: "LGW", city: "London", country: "United Kingdom", name: "Gatwick" },
  { code: "STN", city: "London", country: "United Kingdom", name: "Stansted" },
  { code: "LTN", city: "London", country: "United Kingdom", name: "Luton" },
  { code: "MAN", city: "Manchester", country: "United Kingdom", name: "Manchester" },
  { code: "BHX", city: "Birmingham", country: "United Kingdom", name: "Birmingham" },
  { code: "EDI", city: "Edinburgh", country: "United Kingdom", name: "Edinburgh" },
  { code: "GLA", city: "Glasgow", country: "United Kingdom", name: "Glasgow" },
  { code: "DUB", city: "Dublin", country: "Ireland", name: "Dublin" },
  { code: "CDG", city: "Paris", country: "France", name: "Charles de Gaulle" },
  { code: "ORY", city: "Paris", country: "France", name: "Orly" },
  { code: "NCE", city: "Nice", country: "France", name: "Côte d'Azur" },
  { code: "LYS", city: "Lyon", country: "France", name: "Saint-Exupéry" },
  { code: "MRS", city: "Marseille", country: "France", name: "Provence" },
  { code: "FRA", city: "Frankfurt", country: "Germany", name: "Frankfurt" },
  { code: "MUC", city: "Munich", country: "Germany", name: "Munich" },
  { code: "BER", city: "Berlin", country: "Germany", name: "Brandenburg" },
  { code: "HAM", city: "Hamburg", country: "Germany", name: "Hamburg" },
  { code: "DUS", city: "Düsseldorf", country: "Germany", name: "Düsseldorf" },
  { code: "AMS", city: "Amsterdam", country: "Netherlands", name: "Schiphol" },
  { code: "BRU", city: "Brussels", country: "Belgium", name: "Brussels" },
  { code: "ZRH", city: "Zurich", country: "Switzerland", name: "Zurich" },
  { code: "GVA", city: "Geneva", country: "Switzerland", name: "Geneva" },
  { code: "VIE", city: "Vienna", country: "Austria", name: "Vienna" },
  { code: "MAD", city: "Madrid", country: "Spain", name: "Barajas" },
  { code: "BCN", city: "Barcelona", country: "Spain", name: "El Prat" },
  { code: "AGP", city: "Málaga", country: "Spain", name: "Costa del Sol" },
  { code: "PMI", city: "Palma de Mallorca", country: "Spain", name: "Son Sant Joan" },
  { code: "LIS", city: "Lisbon", country: "Portugal", name: "Humberto Delgado" },
  { code: "OPO", city: "Porto", country: "Portugal", name: "Francisco Sá Carneiro" },
  { code: "FCO", city: "Rome", country: "Italy", name: "Fiumicino" },
  { code: "MXP", city: "Milan", country: "Italy", name: "Malpensa" },
  { code: "VCE", city: "Venice", country: "Italy", name: "Marco Polo" },
  { code: "NAP", city: "Naples", country: "Italy", name: "Capodichino" },
  { code: "ATH", city: "Athens", country: "Greece", name: "Eleftherios Venizelos" },
  { code: "IST", city: "Istanbul", country: "Turkey", name: "Istanbul Airport" },
  { code: "SAW", city: "Istanbul", country: "Turkey", name: "Sabiha Gökçen" },
  { code: "CPH", city: "Copenhagen", country: "Denmark", name: "Kastrup" },
  { code: "ARN", city: "Stockholm", country: "Sweden", name: "Arlanda" },
  { code: "OSL", city: "Oslo", country: "Norway", name: "Gardermoen" },
  { code: "HEL", city: "Helsinki", country: "Finland", name: "Vantaa" },
  { code: "KEF", city: "Reykjavík", country: "Iceland", name: "Keflavík" },
  { code: "WAW", city: "Warsaw", country: "Poland", name: "Chopin" },
  { code: "PRG", city: "Prague", country: "Czech Republic", name: "Václav Havel" },
  { code: "BUD", city: "Budapest", country: "Hungary", name: "Ferenc Liszt" },
  { code: "OTP", city: "Bucharest", country: "Romania", name: "Henri Coandă" },
  { code: "SVO", city: "Moscow", country: "Russia", name: "Sheremetyevo" },
  { code: "DME", city: "Moscow", country: "Russia", name: "Domodedovo" },
  { code: "LED", city: "Saint Petersburg", country: "Russia", name: "Pulkovo" },
  { code: "KBP", city: "Kyiv", country: "Ukraine", name: "Boryspil" },

  // North America
  { code: "JFK", city: "New York", country: "United States", name: "John F. Kennedy" },
  { code: "LGA", city: "New York", country: "United States", name: "LaGuardia" },
  { code: "EWR", city: "Newark", country: "United States", name: "Liberty International" },
  { code: "LAX", city: "Los Angeles", country: "United States", name: "Los Angeles International" },
  { code: "SFO", city: "San Francisco", country: "United States", name: "San Francisco International" },
  { code: "SAN", city: "San Diego", country: "United States", name: "San Diego International" },
  { code: "SEA", city: "Seattle", country: "United States", name: "Seattle-Tacoma" },
  { code: "PDX", city: "Portland", country: "United States", name: "Portland International" },
  { code: "LAS", city: "Las Vegas", country: "United States", name: "Harry Reid International" },
  { code: "PHX", city: "Phoenix", country: "United States", name: "Sky Harbor" },
  { code: "DEN", city: "Denver", country: "United States", name: "Denver International" },
  { code: "DFW", city: "Dallas", country: "United States", name: "Dallas/Fort Worth" },
  { code: "IAH", city: "Houston", country: "United States", name: "George Bush Intercontinental" },
  { code: "AUS", city: "Austin", country: "United States", name: "Bergstrom International" },
  { code: "ORD", city: "Chicago", country: "United States", name: "O'Hare" },
  { code: "MDW", city: "Chicago", country: "United States", name: "Midway" },
  { code: "DTW", city: "Detroit", country: "United States", name: "Detroit Metropolitan" },
  { code: "MSP", city: "Minneapolis", country: "United States", name: "Minneapolis-Saint Paul" },
  { code: "ATL", city: "Atlanta", country: "United States", name: "Hartsfield-Jackson" },
  { code: "MIA", city: "Miami", country: "United States", name: "Miami International" },
  { code: "MCO", city: "Orlando", country: "United States", name: "Orlando International" },
  { code: "FLL", city: "Fort Lauderdale", country: "United States", name: "Hollywood International" },
  { code: "TPA", city: "Tampa", country: "United States", name: "Tampa International" },
  { code: "BOS", city: "Boston", country: "United States", name: "Logan International" },
  { code: "PHL", city: "Philadelphia", country: "United States", name: "Philadelphia International" },
  { code: "IAD", city: "Washington", country: "United States", name: "Dulles International" },
  { code: "DCA", city: "Washington", country: "United States", name: "Reagan National" },
  { code: "BWI", city: "Baltimore", country: "United States", name: "BWI Marshall" },
  { code: "CLT", city: "Charlotte", country: "United States", name: "Douglas International" },
  { code: "RDU", city: "Raleigh", country: "United States", name: "Raleigh-Durham" },
  { code: "HNL", city: "Honolulu", country: "United States", name: "Daniel K. Inouye" },
  { code: "ANC", city: "Anchorage", country: "United States", name: "Ted Stevens" },
  { code: "YYZ", city: "Toronto", country: "Canada", name: "Pearson International" },
  { code: "YUL", city: "Montreal", country: "Canada", name: "Pierre Elliott Trudeau" },
  { code: "YVR", city: "Vancouver", country: "Canada", name: "Vancouver International" },
  { code: "YYC", city: "Calgary", country: "Canada", name: "Calgary International" },
  { code: "YOW", city: "Ottawa", country: "Canada", name: "Macdonald-Cartier" },
  { code: "YEG", city: "Edmonton", country: "Canada", name: "Edmonton International" },
  { code: "MEX", city: "Mexico City", country: "Mexico", name: "Benito Juárez" },
  { code: "CUN", city: "Cancún", country: "Mexico", name: "Cancún International" },
  { code: "GDL", city: "Guadalajara", country: "Mexico", name: "Miguel Hidalgo" },

  // Central America & Caribbean
  { code: "PTY", city: "Panama City", country: "Panama", name: "Tocumen International" },
  { code: "SJO", city: "San José", country: "Costa Rica", name: "Juan Santamaría" },
  { code: "HAV", city: "Havana", country: "Cuba", name: "José Martí" },
  { code: "SDQ", city: "Santo Domingo", country: "Dominican Republic", name: "Las Américas" },
  { code: "PUJ", city: "Punta Cana", country: "Dominican Republic", name: "Punta Cana" },
  { code: "SJU", city: "San Juan", country: "Puerto Rico", name: "Luis Muñoz Marín" },
  { code: "MBJ", city: "Montego Bay", country: "Jamaica", name: "Sangster International" },
  { code: "NAS", city: "Nassau", country: "Bahamas", name: "Lynden Pindling" },

  // South America
  { code: "GRU", city: "São Paulo", country: "Brazil", name: "Guarulhos International" },
  { code: "GIG", city: "Rio de Janeiro", country: "Brazil", name: "Galeão" },
  { code: "BSB", city: "Brasília", country: "Brazil", name: "Juscelino Kubitschek" },
  { code: "EZE", city: "Buenos Aires", country: "Argentina", name: "Ezeiza" },
  { code: "SCL", city: "Santiago", country: "Chile", name: "Arturo Merino Benítez" },
  { code: "LIM", city: "Lima", country: "Peru", name: "Jorge Chávez" },
  { code: "BOG", city: "Bogotá", country: "Colombia", name: "El Dorado" },
  { code: "MDE", city: "Medellín", country: "Colombia", name: "José María Córdova" },
  { code: "UIO", city: "Quito", country: "Ecuador", name: "Mariscal Sucre" },
  { code: "CCS", city: "Caracas", country: "Venezuela", name: "Simón Bolívar" },
  { code: "MVD", city: "Montevideo", country: "Uruguay", name: "Carrasco International" },

  // Asia
  { code: "BOM", city: "Mumbai", country: "India", name: "Chhatrapati Shivaji Maharaj" },
  { code: "DEL", city: "Delhi", country: "India", name: "Indira Gandhi International" },
  { code: "BLR", city: "Bengaluru", country: "India", name: "Kempegowda International" },
  { code: "MAA", city: "Chennai", country: "India", name: "Chennai International" },
  { code: "HYD", city: "Hyderabad", country: "India", name: "Rajiv Gandhi International" },
  { code: "CCU", city: "Kolkata", country: "India", name: "Netaji Subhas Chandra Bose" },
  { code: "COK", city: "Kochi", country: "India", name: "Cochin International" },
  { code: "GOI", city: "Goa", country: "India", name: "Dabolim" },
  { code: "KHI", city: "Karachi", country: "Pakistan", name: "Jinnah International" },
  { code: "LHE", city: "Lahore", country: "Pakistan", name: "Allama Iqbal International" },
  { code: "ISB", city: "Islamabad", country: "Pakistan", name: "Islamabad International" },
  { code: "DAC", city: "Dhaka", country: "Bangladesh", name: "Hazrat Shahjalal" },
  { code: "CMB", city: "Colombo", country: "Sri Lanka", name: "Bandaranaike International" },
  { code: "KTM", city: "Kathmandu", country: "Nepal", name: "Tribhuvan International" },
  { code: "MLE", city: "Malé", country: "Maldives", name: "Velana International" },
  { code: "BKK", city: "Bangkok", country: "Thailand", name: "Suvarnabhumi" },
  { code: "DMK", city: "Bangkok", country: "Thailand", name: "Don Mueang" },
  { code: "HKT", city: "Phuket", country: "Thailand", name: "Phuket International" },
  { code: "CNX", city: "Chiang Mai", country: "Thailand", name: "Chiang Mai International" },
  { code: "SIN", city: "Singapore", country: "Singapore", name: "Changi" },
  { code: "KUL", city: "Kuala Lumpur", country: "Malaysia", name: "Kuala Lumpur International" },
  { code: "PEN", city: "Penang", country: "Malaysia", name: "Penang International" },
  { code: "CGK", city: "Jakarta", country: "Indonesia", name: "Soekarno-Hatta" },
  { code: "DPS", city: "Denpasar", country: "Indonesia", name: "Ngurah Rai (Bali)" },
  { code: "MNL", city: "Manila", country: "Philippines", name: "Ninoy Aquino" },
  { code: "CEB", city: "Cebu", country: "Philippines", name: "Mactan-Cebu International" },
  { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam", name: "Tan Son Nhat" },
  { code: "HAN", city: "Hanoi", country: "Vietnam", name: "Noi Bai" },
  { code: "PNH", city: "Phnom Penh", country: "Cambodia", name: "Phnom Penh International" },
  { code: "RGN", city: "Yangon", country: "Myanmar", name: "Yangon International" },
  { code: "HKG", city: "Hong Kong", country: "Hong Kong", name: "Chek Lap Kok" },
  { code: "TPE", city: "Taipei", country: "Taiwan", name: "Taoyuan International" },
  { code: "PEK", city: "Beijing", country: "China", name: "Beijing Capital" },
  { code: "PKX", city: "Beijing", country: "China", name: "Beijing Daxing" },
  { code: "PVG", city: "Shanghai", country: "China", name: "Pudong" },
  { code: "SHA", city: "Shanghai", country: "China", name: "Hongqiao" },
  { code: "CAN", city: "Guangzhou", country: "China", name: "Baiyun International" },
  { code: "SZX", city: "Shenzhen", country: "China", name: "Bao'an International" },
  { code: "CTU", city: "Chengdu", country: "China", name: "Shuangliu International" },
  { code: "XIY", city: "Xi'an", country: "China", name: "Xianyang International" },
  { code: "ICN", city: "Seoul", country: "South Korea", name: "Incheon International" },
  { code: "GMP", city: "Seoul", country: "South Korea", name: "Gimpo International" },
  { code: "NRT", city: "Tokyo", country: "Japan", name: "Narita International" },
  { code: "HND", city: "Tokyo", country: "Japan", name: "Haneda" },
  { code: "KIX", city: "Osaka", country: "Japan", name: "Kansai International" },
  { code: "NGO", city: "Nagoya", country: "Japan", name: "Chubu Centrair" },
  { code: "FUK", city: "Fukuoka", country: "Japan", name: "Fukuoka" },
  { code: "CTS", city: "Sapporo", country: "Japan", name: "New Chitose" },
  { code: "ULN", city: "Ulaanbaatar", country: "Mongolia", name: "Chinggis Khaan International" },
  { code: "TAS", city: "Tashkent", country: "Uzbekistan", name: "Tashkent International" },
  { code: "ALA", city: "Almaty", country: "Kazakhstan", name: "Almaty International" },

  // Oceania
  { code: "SYD", city: "Sydney", country: "Australia", name: "Kingsford Smith" },
  { code: "MEL", city: "Melbourne", country: "Australia", name: "Tullamarine" },
  { code: "BNE", city: "Brisbane", country: "Australia", name: "Brisbane" },
  { code: "PER", city: "Perth", country: "Australia", name: "Perth" },
  { code: "ADL", city: "Adelaide", country: "Australia", name: "Adelaide" },
  { code: "CNS", city: "Cairns", country: "Australia", name: "Cairns" },
  { code: "AKL", city: "Auckland", country: "New Zealand", name: "Auckland" },
  { code: "WLG", city: "Wellington", country: "New Zealand", name: "Wellington" },
  { code: "CHC", city: "Christchurch", country: "New Zealand", name: "Christchurch" },
  { code: "NAN", city: "Nadi", country: "Fiji", name: "Nadi International" },
  { code: "PPT", city: "Papeete", country: "French Polynesia", name: "Faa'a International" },
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
