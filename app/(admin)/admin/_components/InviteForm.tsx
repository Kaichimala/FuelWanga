"use client";

import { useState, useTransition } from "react";
import { revokeInvite } from "../actions";
import { MALAWI_DISTRICTS } from "@/lib/malawi";

const OTHER = "__other__";

interface Brand {
  id: number;
  name: string;
  is_active: boolean;
}

interface Invite {
  id: string;
  brand: string;
  city: string;
  area: string;
  created_at: string;
  expires_at: string;
}

export function InviteForm({ brands }: { brands: Brand[] }) {
  const firstActive = brands.find((b) => b.is_active)?.name ?? OTHER;
  const [brandSelect, setBrandSelect] = useState(firstActive);
  const [customBrand, setCustomBrand] = useState("");
  const [city, setCity] = useState<string>(MALAWI_DISTRICTS[0]);
  const [area, setArea] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // The brand sent to the API: either the selected known brand or the custom text
  const effectiveBrand = brandSelect === OTHER ? customBrand.trim() : brandSelect;

  const fieldClass =
    "min-h-[44px] w-full rounded-[10px] border border-line bg-bg px-3 py-2 text-ink";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInviteUrl(null);

    if (!effectiveBrand) {
      setError("Please enter a brand name.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand: effectiveBrand, city, area }),
    });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to create invite.");
      return;
    }
    const { url } = await res.json();
    setInviteUrl(url);
    setArea("");
    setCustomBrand("");
  }

  function copyUrl() {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="grid gap-3">
        <div className="grid grid-cols-1 gap-2.5 min-[521px]:grid-cols-3">
          {/* Brand selector */}
          <div className="grid gap-1 text-sm">
            <label htmlFor="brand-select">Brand</label>
            <select
              id="brand-select"
              value={brandSelect}
              onChange={(e) => setBrandSelect(e.target.value)}
              className={fieldClass}
            >
              {brands.filter((b) => b.is_active).map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
              <option value={OTHER}>Other (enter below)</option>
            </select>
            {/* Custom brand input — shown only when "Other" is selected */}
            {brandSelect === OTHER && (
              <input
                type="text"
                required
                placeholder="Type brand name"
                value={customBrand}
                onChange={(e) => setCustomBrand(e.target.value)}
                maxLength={100}
                className={`mt-1 ${fieldClass}`}
                aria-label="Custom brand name"
              />
            )}
          </div>

          <label className="grid gap-1 text-sm">
            City (district)
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={fieldClass}
            >
              {MALAWI_DISTRICTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            Area
            <input
              type="text"
              required
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Kanengo"
              className={fieldClass}
            />
          </label>
        </div>

        {error && <p className="text-sm text-out">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="min-h-[44px] rounded-[10px] bg-accent px-4 text-accenttext text-sm disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create invite link"}
        </button>
      </form>

      {inviteUrl && (
        <div className="mt-4 rounded-[10px] border border-ok bg-okbg p-4">
          <p className="mb-2 text-sm font-semibold text-ok">
            Invite link created. Share this once:
          </p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={inviteUrl}
              className="min-h-[44px] flex-1 rounded-[10px] border border-line bg-bg px-3 py-2 text-xs text-ink"
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              onClick={copyUrl}
              className="min-h-[44px] whitespace-nowrap rounded-[10px] border border-line bg-bg px-3 text-sm text-ink"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">
            This link is only shown once. The token is not stored; only a hash is kept in the
            database.
          </p>
        </div>
      )}
    </div>
  );
}

export function PendingInvitesList({ invites }: { invites: Invite[] }) {
  const [isPending, startTransition] = useTransition();

  if (invites.length === 0) {
    return <p className="text-sm text-muted">No pending invites.</p>;
  }

  return (
    <div className="grid gap-2">
      {invites.map((inv) => (
        <div
          key={inv.id}
          className="flex items-center justify-between gap-3 rounded-[10px] border border-line bg-bg px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium">
              {inv.brand} {inv.area}, {inv.city}
            </p>
            <p className="text-xs text-muted">
              Expires {new Date(inv.expires_at).toLocaleDateString("en-GB")}
            </p>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await revokeInvite(inv.id);
              })
            }
            className="min-h-[44px] rounded-[10px] border border-out bg-outbg px-3 text-xs text-out disabled:opacity-60"
          >
            Revoke
          </button>
        </div>
      ))}
    </div>
  );
}
