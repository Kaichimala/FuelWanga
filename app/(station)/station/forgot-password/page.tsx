"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/station/update-password`,
    });
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <main className="mx-auto max-w-md px-4 pt-16 pb-16">
        <h1 className="mb-4 text-2xl font-extrabold">Check your email</h1>
        <p className="text-muted">
          If that email is registered, we sent a reset link. Check your inbox and spam folder.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-16 pb-16">
      <h1 className="mb-6 text-2xl font-extrabold">Reset password</h1>
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
        <button
          type="submit"
          disabled={loading}
          className="min-h-[44px] rounded-[10px] bg-accent px-4 text-accenttext disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="mt-4 text-sm text-muted">
        <a href="/station/login" className="underline">
          Back to sign in
        </a>
      </p>
    </main>
  );
}
