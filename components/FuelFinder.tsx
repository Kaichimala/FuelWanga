"use client";

import { useCallback, useMemo, useState } from "react";
import { ALL_LOCATIONS, cities, stations } from "@/lib/stations";
import { overall, rank, statusWord } from "@/lib/fuel";
import type { Filters, FuelFilter, StatusFilter } from "@/lib/types";
import ChipGroup from "./ChipGroup";
import StationCard from "./StationCard";
import StationSheet from "./StationSheet";

const FUEL_OPTIONS: readonly FuelFilter[] = ["Any", "Petrol", "Diesel"];
const STATUS_OPTIONS: readonly StatusFilter[] = ["All", "Has fuel", "No fuel"];

const fieldClass =
  "mt-1 min-h-[44px] w-full rounded-[10px] border border-line bg-bg px-3 py-2.5 text-ink";

export default function FuelFinder() {
  const [filters, setFilters] = useState<Filters>({
    city: ALL_LOCATIONS,
    fuel: "Any",
    status: "All",
    q: "",
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);

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
      .sort((a, b) => rank[a.o] - rank[b.o] || a.s.mins - b.s.mins);
  }, [filters]);

  const closeSheet = useCallback(() => setSelectedId(null), []);
  const selected = selectedId == null ? null : stations[selectedId];

  return (
    <>
      <main className="mx-auto max-w-[860px] px-4 pt-5 pb-16">
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
                {cities.map((c) => (
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
          {results.length} {results.length === 1 ? "station" : "stations"} found
        </p>

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

        <p className="mt-7 text-[.85rem] text-muted">
          This preview uses sample data. Real station updates will appear here once they are
          connected.
        </p>
      </main>

      <StationSheet station={selected} onClose={closeSheet} />
    </>
  );
}
