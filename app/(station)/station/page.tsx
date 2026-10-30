import { requireStationStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import StationStatusForm from "./_components/StationStatusForm";

export default async function StationDashboardPage() {
  const { user, stations } = await requireStationStaff();

  async function handleSignOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  return (
    <main className="mx-auto max-w-[860px] px-4 pt-8 pb-16">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold">Station dashboard</h1>
        <form action={handleSignOut}>
          <button
            type="submit"
            className="min-h-[44px] rounded-[10px] border border-line bg-bg px-4 py-2 text-ink text-sm"
          >
            Sign out
          </button>
        </form>
      </div>

      <p className="mb-1 text-sm text-muted">Signed in as {user.email}</p>

      {stations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-surface p-7 text-center text-muted">
          <b>You are not linked to any station.</b>
          <br />
          Contact your administrator.
        </div>
      ) : (
        <div className="grid gap-4">
          {stations.map((station) => (
            <StationStatusForm key={station.id} station={station} />
          ))}
        </div>
      )}
    </main>
  );
}
