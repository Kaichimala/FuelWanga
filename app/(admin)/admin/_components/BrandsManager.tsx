"use client";

import { useState, useTransition } from "react";
import { addBrand, deactivateBrand } from "../actions";

interface Brand {
  id: number;
  name: string;
  is_active: boolean;
}

export default function BrandsManager({ brands }: { brands: Brand[] }) {
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await addBrand(newName);
      if (result?.error) {
        setError(result.error);
      } else {
        setNewName("");
      }
    });
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          required
          placeholder="New brand name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="min-h-[44px] flex-1 rounded-[10px] border border-line bg-bg px-3 py-2 text-ink text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="min-h-[44px] rounded-[10px] bg-accent px-4 text-accenttext text-sm disabled:opacity-60 whitespace-nowrap"
        >
          Add brand
        </button>
      </form>
      {error && <p className="mb-3 text-sm text-out">{error}</p>}

      <div className="grid gap-2">
        {brands.map((b) => (
          <div
            key={b.id}
            className={`flex items-center justify-between gap-3 rounded-[10px] border border-line bg-bg px-4 py-3 ${!b.is_active ? "opacity-50" : ""}`}
          >
            <span className="text-sm font-medium">
              {b.name}
              {!b.is_active && (
                <span className="ml-2 text-xs text-muted">(inactive)</span>
              )}
            </span>
            {b.is_active && (
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await deactivateBrand(b.id);
                  })
                }
                className="min-h-[44px] rounded-[10px] border border-out bg-outbg px-3 text-xs text-out disabled:opacity-60"
              >
                Deactivate
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
