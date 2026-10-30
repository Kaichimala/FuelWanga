import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-free Supabase client for the public page only.
 *
 * Why a separate client?
 * Reading cookies makes Next.js opt a Server Component out of static /
 * ISR caching. The public page uses `export const revalidate = 60` and
 * must never import a cookie-aware client. This client reads only the
 * anon-accessible `stations_public` view and never touches auth.
 */
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);
