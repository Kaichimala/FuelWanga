"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function StationLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/station");
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-16 pb-16">
      <h1 className="mb-6 text-2xl font-extrabold">Station sign in</h1>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="grid gap-1">
          Email
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
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-[44px] rounded-[10px] border border-line bg-bg px-3 py-2 text-ink"
          />
        </label>
        {error && <p className="text-out text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="min-h-[44px] rounded-[10px] bg-accent px-4 text-accenttext disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-muted">
        <a href="/station/forgot-password" className="underline">
          Forgot password?
        </a>
      </p>
    </main>
  );
}
