import type { DbStatus, Filters, Station, Status } from "./types";

// ---------------------------------------------------------------------------
// DB → UI status mapper
// ---------------------------------------------------------------------------
export function dbStatusToStatus(s: DbStatus): Status {
  return s === "has_fuel" ? "ok" : "out";
}

// ---------------------------------------------------------------------------
// Display strings
// ---------------------------------------------------------------------------
export const statusWord: Record<Status, string> = {
  ok: "Has fuel",
  low: "Low fuel",
  out: "No fuel",
};

export const rank: Record<Status, number> = { ok: 0, low: 1, out: 2 };

// Full class strings so Tailwind can detect them at build time.
export const pillStyle: Record<Status, string> = {
  ok: "bg-okbg text-ok",
  low: "bg-lowbg text-low",
  out: "bg-outbg text-out",
};

export const cardBorder: Record<Status, string> = {
  ok: "border-l-ok",
  low: "border-l-low",
  out: "border-l-out",
};

// ---------------------------------------------------------------------------
// Overall status for a station given the active fuel filter
// ---------------------------------------------------------------------------
export function overall(s: Station, fuel: Filters["fuel"]): Status {
  if (fuel === "Petrol") return s.petrol;
  if (fuel === "Diesel") return s.diesel;
  return rank[s.petrol] <= rank[s.diesel] ? s.petrol : s.diesel;
}

// ---------------------------------------------------------------------------
// Relative time – accepts an ISO timestamp string
// ---------------------------------------------------------------------------
export function ago(isoTimestamp: string): string {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
}

// ---------------------------------------------------------------------------
// ETA display – accepts an ISO timestamp string or null
// Format: "Monday, 3 November, 5:30 pm" in Africa/Blantyre time
// ---------------------------------------------------------------------------
export function etaText(isoTimestamp: string | null): string {
  if (!isoTimestamp) return "No estimate yet.";
  const d = new Date(isoTimestamp);
  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Blantyre",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
  return `Estimated arrival of the next delivery: ${formatted}.`;
}
