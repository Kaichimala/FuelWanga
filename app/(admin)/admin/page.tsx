import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import StationTable from "./_components/StationTable";
import { InviteForm, PendingInvitesList } from "./_components/InviteForm";
import BrandsManager from "./_components/BrandsManager";

export default async function AdminDashboardPage() {
  await requireSuperAdmin();
  const supabase = await createClient();

  const [stationsRes, invitesRes, brandsRes] = await Promise.all([
    supabase
      .from("stations")
      .select("id, name, brand, city, area, petrol_status, diesel_status, updated_at, is_active")
      .order("name"),
    supabase
      .from("station_invites")
      .select("id, brand, city, area, created_at, expires_at")
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false }),
    supabase.from("brands").select("id, name, is_active").order("name"),
  ]);

  const stations = stationsRes.data ?? [];
  const invites = invitesRes.data ?? [];
  const brands = brandsRes.data ?? [];

  async function handleSignOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  return (
    <main className="mx-auto max-w-[1100px] px-4 pt-8 pb-16">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold">Admin dashboard</h1>
        <form action={handleSignOut}>
          <button
            type="submit"
            className="min-h-[44px] rounded-[10px] border border-line bg-bg px-4 py-2 text-ink text-sm"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* ── Stations ── */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold">Stations</h2>
        {stations.length === 0 ? (
          <p className="text-sm text-muted">No stations registered yet.</p>
        ) : (
          <StationTable stations={stations} brands={brands} />
        )}
      </section>

      {/* ── Invite a station ── */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold">Invite a station</h2>
        <InviteForm brands={brands} />
      </section>

      {/* ── Pending invites ── */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold">Pending invites</h2>
        <PendingInvitesList invites={invites} />
      </section>

      {/* ── Brands ── */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Brands</h2>
        <BrandsManager brands={brands} />
      </section>
    </main>
  );
}
