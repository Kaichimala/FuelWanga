"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateStationStatus } from "../actions";

interface StationData {
  id: string;
  name: string;
  brand: string;
  city: string;
  area: string;
  petrol_status: string;
  diesel_status: string;
  petrol_eta: string | null;
  diesel_eta: string | null;
  updated_at: string;
}

/** Convert a datetime-local string (in Africa/Blantyre local time) to an ISO UTC string */
function blantyreDatetimeToISO(localDatetime: string): string {
  // datetime-local gives "YYYY-MM-DDTHH:mm". We treat it as Blantyre time (UTC+2).
  // The safest cross-browser approach: append the offset.
  return new Date(`${localDatetime}+02:00`).toISOString();
}

export default function StationStatusForm({ station }: { station: StationData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [petrolStatus, setPetrolStatus] = useState<"has_fuel" | "no_fuel">(
    station.petrol_status as "has_fuel" | "no_fuel",
  );
  const [dieselStatus, setDieselStatus] = useState<"has_fuel" | "no_fuel">(
    station.diesel_status as "has_fuel" | "no_fuel",
  );
  const [petrolEta, setPetrolEta] = useState(
    station.petrol_eta
      ? new Date(station.petrol_eta).toISOString().slice(0, 16)
      : "",
  );
  const [dieselEta, setDieselEta] = useState(
    station.diesel_eta
      ? new Date(station.diesel_eta).toISOString().slice(0, 16)
      : "",
  );

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      station_id: station.id,
      petrol_status: petrolStatus,
      diesel_status: dieselStatus,
      petrol_eta: petrolStatus === "no_fuel" && petrolEta ? blantyreDatetimeToISO(petrolEta) : null,
      diesel_eta: dieselStatus === "no_fuel" && dieselEta ? blantyreDatetimeToISO(dieselEta) : null,
    };
    startTransition(async () => {
      const result = await updateStationStatus(payload);
      if (result?.error) {
        showToast(result.error, false);
      } else {
        showToast("Status updated.", true);
        router.refresh();
      }
    });
  }

  const toggleClass = (active: boolean) =>
    `min-h-[44px] flex-1 rounded-[10px] border px-4 py-2 text-sm font-semibold transition-colors ${
      active
        ? "border-accent bg-accent text-accenttext"
        : "border-line bg-bg text-ink"
    }`;

  return (
    <div className="rounded-[14px] border border-line bg-surface p-4">
      <h2 className="mb-0.5 text-lg font-semibold">{station.name}</h2>
      <p className="mb-4 text-sm text-muted">
        {station.brand} · {station.area}, {station.city}
      </p>

      <form onSubmit={handleSubmit} className="grid gap-5">
        {/* Petrol */}
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Petrol</legend>
          <div className="flex gap-2">
            <button
              type="button"
              className={toggleClass(petrolStatus === "has_fuel")}
              onClick={() => { setPetrolStatus("has_fuel"); setPetrolEta(""); }}
            >
              Has fuel
            </button>
            <button
              type="button"
              className={toggleClass(petrolStatus === "no_fuel")}
              onClick={() => setPetrolStatus("no_fuel")}
            >
              No fuel
            </button>
          </div>
          {petrolStatus === "no_fuel" && (
            <label className="mt-3 grid gap-1 text-sm">
              ETA (optional – Malawi time)
              <input
                type="datetime-local"
                value={petrolEta}
                onChange={(e) => setPetrolEta(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="min-h-[44px] rounded-[10px] border border-line bg-bg px-3 py-2 text-ink"
              />
            </label>
          )}
        </fieldset>

        {/* Diesel */}
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Diesel</legend>
          <div className="flex gap-2">
            <button
              type="button"
              className={toggleClass(dieselStatus === "has_fuel")}
              onClick={() => { setDieselStatus("has_fuel"); setDieselEta(""); }}
            >
              Has fuel
            </button>
            <button
              type="button"
              className={toggleClass(dieselStatus === "no_fuel")}
              onClick={() => setDieselStatus("no_fuel")}
            >
              No fuel
            </button>
          </div>
          {dieselStatus === "no_fuel" && (
            <label className="mt-3 grid gap-1 text-sm">
              ETA (optional – Malawi time)
              <input
                type="datetime-local"
                value={dieselEta}
                onChange={(e) => setDieselEta(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="min-h-[44px] rounded-[10px] border border-line bg-bg px-3 py-2 text-ink"
              />
            </label>
          )}
        </fieldset>

        <button
          type="submit"
          disabled={isPending}
          className="min-h-[44px] rounded-[10px] bg-accent px-4 text-accenttext disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save status"}
        </button>
      </form>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`mt-3 rounded-[10px] px-4 py-3 text-sm font-semibold ${
            toast.ok ? "bg-okbg text-ok" : "bg-outbg text-out"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
