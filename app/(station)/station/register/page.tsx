"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface InviteInfo {
  brand: string;
  city: string;
  area: string;
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Validate the token on page load
  useEffect(() => {
    if (!token) {
      setInviteError("No invite token provided.");
      setLoading(false);
      return;
    }
    fetch(`/api/invites/validate?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("invalid");
        return res.json() as Promise<InviteInfo>;
      })
      .then((data) => {
        setInvite(data);
        setLoading(false);
      })
      .catch(() => {
        setInviteError("This invite link is invalid or has expired.");
        setLoading(false);
      });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (password.length < 10) {
      setSubmitError("Password must be at least 10 characters.");
      return;
    }
    if (password !== confirm) {
      setSubmitError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/register-station", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Only send token, email, password — the server derives brand/city/area from the invite
      body: JSON.stringify({ token, email, password }),
    });
    setSubmitting(false);
    if (res.ok) {
      router.push("/station/login?registered=1");
      return;
    }
    if (res.status === 409) {
      setSubmitError("This station is already registered.");
      return;
    }
    if (res.status === 400) {
      setSubmitError("This invite is invalid or has expired.");
      return;
    }
    setSubmitError("Something went wrong. Please try again.");
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-md px-4 pt-16 pb-16">
        <p className="text-muted">Validating invite…</p>
      </main>
    );
  }

  if (inviteError) {
    return (
      <main className="mx-auto max-w-md px-4 pt-16 pb-16">
        <h1 className="mb-4 text-2xl font-extrabold">Invalid invite</h1>
        <p className="text-out">{inviteError}</p>
        <p className="mt-4 text-sm text-muted">
          Contact your administrator for a new link.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-16 pb-16">
      <h1 className="mb-2 text-2xl font-extrabold">Register your station</h1>
      <p className="mb-6 rounded-[10px] border border-line bg-surface px-4 py-3 text-sm text-muted">
        You&rsquo;re registering:{" "}
        <strong className="text-ink">
          {invite!.brand} {invite!.area}, {invite!.city}
        </strong>
        . These details are fixed by your invite and cannot be changed.
      </p>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="grid gap-1">
          Email address
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-[44px] rounded-[10px] border border-line bg-bg px-3 py-2 text-ink"
          />
        </label>
        <label className="grid gap-1">
          Password <span className="text-muted text-xs">(at least 10 characters)</span>
          <input
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-[44px] rounded-[10px] border border-line bg-bg px-3 py-2 text-ink"
          />
        </label>
        <label className="grid gap-1">
          Confirm password
          <input
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="min-h-[44px] rounded-[10px] border border-line bg-bg px-3 py-2 text-ink"
          />
        </label>
        {submitError && <p className="text-out text-sm">{submitError}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="min-h-[44px] rounded-[10px] bg-accent px-4 text-accenttext disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md px-4 pt-16 pb-16">
          <p className="text-muted">Loading…</p>
        </main>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
