"use client";

import { useEffect, useRef } from "react";
import type { Station, Status } from "@/lib/types";
import { ago, etaText } from "@/lib/fuel";
import StatusPill from "./StatusPill";

function FuelBox({
  label,
  status,
  eta,
}: {
  label: string;
  status: Status;
  eta: string | null;
}) {
  return (
    <div className="mt-3 rounded-xl border border-line p-3.5">
      <div className="flex items-center justify-between gap-2">
        <b className="text-[1.1rem]">{label}</b>
        <StatusPill status={status} />
      </div>
      <p className="mt-2">
        {status === "ok" ? "Pumps are serving this fuel now." : etaText(eta)}
      </p>
    </div>
  );
}

export default function StationSheet({
  station,
  onClose,
}: {
  station: Station | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = station !== null;

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!station) return null;
  const s = station;

  return (
    <div
      className="fixed inset-0 z-20 bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dtitle"
        className="fixed inset-x-0 bottom-0 mx-auto max-h-[88%] max-w-[560px] animate-sheet-up overflow-auto rounded-t-[20px] bg-surface px-[18px] pt-[22px] pb-[calc(24px+env(safe-area-inset-bottom,0px))]"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="float-right min-h-[44px] cursor-pointer rounded-[10px] border border-line bg-bg px-3.5 py-2 text-ink"
        >
          Close
        </button>
        <h2 id="dtitle" className="mb-0.5 text-2xl font-semibold">
          {s.name}
        </h2>
        <div className="text-[.9rem] text-muted">
          {s.brand} in {s.area}, {s.city}
        </div>
        {/* Each fuel type uses its own independent ETA column */}
        <FuelBox label="Petrol" status={s.petrol} eta={s.petrol_eta} />
        <FuelBox label="Diesel" status={s.diesel} eta={s.diesel_eta} />
        <p className="mt-3.5 text-[.85rem] text-muted">
          Updated {ago(s.updated_at)}. Deliveries can change, so call ahead if you are driving far.
        </p>
      </div>
    </div>
  );
}
