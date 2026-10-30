// Public page – Server Component with ISR (revalidate every 60 seconds).
// Uses the cookie-free Supabase client so Next.js can cache this route.
export const revalidate = 60;

import { supabasePublic } from "@/lib/supabase/public";
import type { StationRow } from "@/lib/types";
import FuelFinder from "./_components/FuelFinder";

export default async function Page() {
  const { data, error } = await supabasePublic
    .from("stations_public")
    .select("id, name, brand, city, area, petrol_status, diesel_status, petrol_eta, diesel_eta, updated_at")
    .order("name");

  const stations: StationRow[] = data ?? [];

  // Derive unique cities present in the live data for the location filter
  const cities = Array.from(new Set(stations.map((s) => s.city))).sort();

  return (
    <FuelFinder
      initial={stations}
      cities={cities}
      fetchError={error ? error.message : null}
    />
  );
}
