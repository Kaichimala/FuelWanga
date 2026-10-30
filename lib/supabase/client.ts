import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client.
 * Use in Client Components, event handlers, and client-side hooks.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
