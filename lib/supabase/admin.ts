// ⚠️ SERVER-ONLY – never import this file from a Client Component or any
// NEXT_PUBLIC_ path. Only app/api/invites/route.ts, app/api/invites/validate/
// route.ts, and app/api/register-station/route.ts may import this module.
import "server-only";
import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set. Check your .env.local file.");
}

/**
 * Service-role Supabase client.
 * Bypasses RLS – use only in trusted server-side contexts.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);
