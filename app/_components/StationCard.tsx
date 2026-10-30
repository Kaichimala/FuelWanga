"use client";

import type { Station, Status } from "@/lib/types";
import { cardBorder } from "@/lib/fuel";
import StatusPill from "./StatusPill";

export default function StationCard({
  station: s,
  overall,
  onOpen,
}: {
  station: Station;
  overall: Status;
  onOpen: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(s.id)}
      className={`grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 rounded-xl border border-l-[6px] border-line bg-surface px-4 py-3.5 text-left text-ink hover:border-ink ${cardBorder[overall]}`}
    >
      <div>
        <div className="text-[1.05rem] font-semibold">{s.name}</div>
        <div className="text-[.9rem] text-muted">
          {s.area}, {s.city}
        </div>
      </div>
      <StatusPill status={overall} />
      <div className="col-span-full flex flex-wrap gap-1.5">
        <StatusPill status={s.petrol} prefix="Petrol" />
        <StatusPill status={s.diesel} prefix="Diesel" />
      </div>
    </button>
  );
}
