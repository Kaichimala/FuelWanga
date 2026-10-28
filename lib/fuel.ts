import type { Filters, Station, Status } from "./types";

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

export function overall(s: Station, fuel: Filters["fuel"]): Status {
  if (fuel === "Petrol") return s.petrol;
  if (fuel === "Diesel") return s.diesel;
  return rank[s.petrol] <= rank[s.diesel] ? s.petrol : s.diesel;
}

export function ago(m: number): string {
  return m < 60 ? `${m} minutes ago` : `${Math.round(m / 60)} hours ago`;
}

export function etaText(hours: number | null): string {
  if (hours == null) return "";
  const d = new Date(Date.now() + hours * 3600000);
  const t = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const dt = d.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
  return `Estimated arrival of the next delivery: ${dt}, about ${t}.`;
}
