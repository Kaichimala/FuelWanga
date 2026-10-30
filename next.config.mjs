/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // @supabase/realtime-js imports @supabase/phoenix internally, but that
    // package is not published as a standalone dep and is not needed here
    // because this app does not use Supabase Realtime / Presence.
    // Point it at a no-op stub so both the build and runtime work correctly.
    config.resolve.alias["@supabase/phoenix"] = new URL(
      "./lib/phoenix-stub.js",
      import.meta.url,
    ).pathname;
    return config;
  },
};

export default nextConfig;
