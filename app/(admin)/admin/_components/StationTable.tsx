"use client";

import { useState, useTransition } from "react";
import { setStationActive, deleteStation, editStation } from "../actions";
import { MALAWI_DISTRICTS } from "@/lib/malawi";

interface Station {
  id: string;
  name: string;
  brand: string;
  city: string;
  area: string;
  petrol_status: string;
  diesel_status: string;
  updated_at: string;
  is_active: boolean;
}

interface Brand {
  id: number;
  name: string;
  is_active: boolean;
}

function EditModal({
  station,
  brands,
  onClose,
  onSaved,
}: {
  station: Station;
  brands: Brand[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [brand, setBrand] = useState(station.brand);
  const [city, setCity] = useState(station.city);
  const [area, setArea] = useState(station.area);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await editStation({ id: station.id, brand, city, area });
      if (result?.error) {
        setError(result.error);
      } else {
        onSaved();
        onClose();
      }
    });
  }

  const fieldClass = "min-h-[44px] w-full rounded-[10px] border border-line bg-bg px-3 py-2 text-ink";

  return (
    <div className="fixed inset-0 z-30 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[14px] bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold">Edit station</h2>
        <p className="mb-4 text-sm text-muted">
          The display name regenerates automatically from brand and area.
        </p>
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">
            Brand
            <select value={brand} onChange={(e) => setBrand(e.target.value)} className={fieldClass}>
              {brands.filter((b) => b.is_active).map((b) => (
                <option key={b.id}>{b.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            City (district)
            <select value={city} onChange={(e) => setCity(e.target.value)} className={fieldClass}>
              {MALAWI_DISTRICTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Area
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
        {error && <p className="mt-2 text-sm text-out">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className="min-h-[44px] flex-1 rounded-[10px] bg-accent px-4 text-accenttext text-sm disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] flex-1 rounded-[10px] border border-line bg-bg px-4 text-ink text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StationTable({
  stations,
  brands,
}: {
  stations: Station[];
  brands: Brand[];
}) {
  const [isPending, startTransition] = useTransition();
  const [editTarget, setEditTarget] = useState<Station | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Station | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  function toggleActive(s: Station) {
    startTransition(async () => {
      const result = await setStationActive(s.id, !s.is_active);
      if (result?.error) showToast(result.error);
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    startTransition(async () => {
      const result = await deleteStation(target.id);
      if (result?.error) showToast(result.error);
    });
  }

  return (
    <>
      {toast && (
        <div role="status" aria-live="polite" className="mb-3 rounded-[10px] bg-outbg px-4 py-3 text-sm text-out">
          {toast}
        </div>
      )}

      <div className="overflow-x-auto rounded-[14px] border border-line">
        <table className="w-full text-sm">
          <thead className="bg-surface border-b border-line">
            <tr>
              {["Name", "Brand", "City", "Area", "Petrol", "Diesel", "Updated", "Active", "Actions"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stations.map((s) => (
              <tr key={s.id} className={`border-b border-line last:border-0 ${!s.is_active ? "opacity-50" : ""}`}>
                <td className="px-3 py-2.5 font-medium whitespace-nowrap">{s.name}</td>
                <td className="px-3 py-2.5 text-muted whitespace-nowrap">{s.brand}</td>
                <td className="px-3 py-2.5 text-muted whitespace-nowrap">{s.city}</td>
                <td className="px-3 py-2.5 text-muted whitespace-nowrap">{s.area}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className={s.petrol_status === "has_fuel" ? "text-ok" : "text-out"}>
                    {s.petrol_status === "has_fuel" ? "Has fuel" : "No fuel"}
                  </span>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className={s.diesel_status === "has_fuel" ? "text-ok" : "text-out"}>
                    {s.diesel_status === "has_fuel" ? "Has fuel" : "No fuel"}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-muted whitespace-nowrap">
                  {new Date(s.updated_at).toLocaleDateString("en-GB")}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  {s.is_active ? "Yes" : "No"}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditTarget(s)}
                      className="rounded-[8px] border border-line bg-bg px-2.5 py-1 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(s)}
                      disabled={isPending}
                      className="rounded-[8px] border border-line bg-bg px-2.5 py-1 text-xs"
                    >
                      {s.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(s)}
                      className="rounded-[8px] border border-out bg-outbg px-2.5 py-1 text-xs text-out"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirm dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-30 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-[14px] bg-surface p-6">
            <h2 className="mb-2 text-lg font-semibold">Delete station?</h2>
            <p className="mb-4 text-sm text-muted">
              This will permanently delete <strong>{deleteTarget.name}</strong> and cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isPending}
                className="min-h-[44px] flex-1 rounded-[10px] bg-out px-4 text-sm text-white disabled:opacity-60"
              >
                {isPending ? "Deleting…" : "Delete"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="min-h-[44px] flex-1 rounded-[10px] border border-line bg-bg px-4 text-ink text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editTarget && (
        <EditModal
          station={editTarget}
          brands={brands}
          onClose={() => setEditTarget(null)}
          onSaved={() => setEditTarget(null)}
        />
      )}
    </>
  );
}
