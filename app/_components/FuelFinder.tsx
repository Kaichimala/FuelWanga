"use client";

import { useCallback, useMemo, useState } from "react";
import { ALL_LOCATIONS } from "@/lib/malawi";
import { dbStatusToStatus, overall, rank, statusWord } from "@/lib/fuel";
import type { Filters, FuelFilter, Station, StationRow, StatusFilter } from "@/lib/types";
import ChipGroup from "./ChipGroup";
import StationCard from "./StationCard";
import StationSheet from "./StationSheet";

const FUEL_OPTIONS: readonly FuelFilter[] = ["Any", "Petrol", "Diesel"];
const STATUS_OPTIONS: readonly StatusFilter[] = ["All", "Has fuel", "No fuel"];

const fieldClass =
  "mt-1 min-h-[44px] w-full rounded-[10px] border border-line bg-bg px-3 py-2.5 text-ink";

/** Map a DB row to a UI Station, computing the Status enum values. */
function rowToStation(row: StationRow): Station {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    city: row.city,
    area: row.area,
    petrol: dbStatusToStatus(row.petrol_status),
    diesel: dbStatusToStatus(row.diesel_status),
    petrol_eta: row.petrol_eta,
    diesel_eta: row.diesel_eta,
    updated_at: row.updated_at,
  };
}

interface Props {
  /** Server-fetched initial data passed from the Server Component. */
  initial: StationRow[];
  /** Unique cities present in the data (derived server-side). */
  cities: string[];
  /** Non-null means the initial fetch failed. */
  fetchError: string | null;
}

export default function FuelFinder({ initial, cities, fetchError }: Props) {
  const [stations] = useState<Station[]>(() => initial.map(rowToStation));
  const [error] = useState<string | null>(fetchError);

  const allCities = [ALL_LOCATIONS, ...cities];

  const [filters, setFilters] = useState<Filters>({
    city: ALL_LOCATIONS,
    fuel: "Any",
    status: "All",
    q: "",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const results = useMemo(() => {
    const q = filters.q.toLowerCase().trim();
    return stations
      .map((s) => ({ s, o: overall(s, filters.fuel) }))
      .filter(({ s, o }) => {
        if (filters.city !== ALL_LOCATIONS && s.city !== filters.city) return false;
        if (q && !`${s.name} ${s.area} ${s.brand}`.toLowerCase().includes(q)) return false;
        if (filters.status !== "All" && statusWord[o] !== filters.status) return false;
        return true;
      })
      .sort(
        (a, b) =>
          rank[a.o] - rank[b.o] ||
          new Date(b.s.updated_at).getTime() - new Date(a.s.updated_at).getTime(),
      );
  }, [filters, stations]);

  const closeSheet = useCallback(() => setSelectedId(null), []);
  const selected = selectedId == null ? null : (stations.find((s) => s.id === selectedId) ?? null);

  return (
    <>
      <main className="mx-auto max-w-[860px] px-4 pt-5 pb-16">
        {/* Malawi flag bar */}
        <div className="flex h-1.5 w-24 overflow-hidden rounded-[3px]" aria-hidden="true">
          <i className="flex-1 bg-[#111]" />
          <i className="flex-1 bg-[#ce1126]" />
          <i className="flex-1 bg-[#339e35]" />
        </div>
        <h1 className="mt-3 mb-2 text-[clamp(2rem,6vw,3.2rem)] font-extrabold leading-[1.02] tracking-[-.02em]">
          Where is fuel today?
        </h1>
        <p className="mb-5 max-w-[46ch] text-muted">
          Check which stations have petrol or diesel before you drive. No account needed.
        </p>

        <section
          aria-label="Filters"
          className="grid gap-3.5 rounded-[14px] border border-line bg-surface p-3.5"
        >
          <div className="grid grid-cols-1 gap-2.5 min-[521px]:grid-cols-2">
            <label>
              Location
              <select
                className={fieldClass}
                value={filters.city}
                onChange={(e) => set("city", e.target.value)}
              >
                {allCities.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Search by station or area
              <input
                type="search"
                className={fieldClass}
                placeholder="For example, Area 3"
                value={filters.q}
                onChange={(e) => set("q", e.target.value)}
              />
            </label>
          </div>
          <ChipGroup
            label="Fuel type"
            options={FUEL_OPTIONS}
            value={filters.fuel}
            onChange={(v) => set("fuel", v)}
          />
          <ChipGroup
            label="Availability"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(v) => set("status", v)}
          />
        </section>

        <p className="mx-0.5 mt-[18px] mb-2.5 text-[.95rem] text-muted" aria-live="polite">
          {error ? (
            <span className="text-out">Couldn't load stations. Please try again.</span>
          ) : (
            `${results.length} ${results.length === 1 ? "station" : "stations"} found`
          )}
        </p>

        {error ? (
          <div className="rounded-xl border border-dashed border-out bg-outbg p-7 text-center text-out">
            <b>Couldn't load stations</b>
            <br />
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-2 underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {results.length ? (
              results.map(({ s, o }) => (
                <StationCard key={s.id} station={s} overall={o} onOpen={setSelectedId} />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-line bg-surface p-7 text-center text-muted">
                <b>No stations match</b>
                <br />
                Try another location or clear a filter.
              </div>
            )}
          </div>
        )}
      </main>

      <StationSheet station={selected} onClose={closeSheet} />
    </>
  );
}
