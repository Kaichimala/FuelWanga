"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 10) {
      setError("Password must be at least 10 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push("/station/login?updated=1");
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-16 pb-16">
      <h1 className="mb-6 text-2xl font-extrabold">Choose a new password</h1>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="grid gap-1">
          New password
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
          Confirm new password
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
        {error && <p className="text-out text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="min-h-[44px] rounded-[10px] bg-accent px-4 text-accenttext disabled:opacity-60"
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </main>
  );
}
