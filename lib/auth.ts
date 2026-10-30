import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

// ---------------------------------------------------------------------------
// requireSuperAdmin
// Use in Server Components and Server Actions that are admin-only.
// Returns the verified user object.
// ---------------------------------------------------------------------------
export async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  const { data: adminRow } = await supabase
    .from("super_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) {
    redirect("/admin/login?reason=not-admin");
  }

  return user;
}

// ---------------------------------------------------------------------------
// requireStationStaff
// Use in Server Components and Server Actions that are station-staff-only.
// Returns the user and their linked stations.
// ---------------------------------------------------------------------------
export async function requireStationStaff() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/station/login");
  }

  const { data: staffRows } = await supabase
    .from("station_staff")
    .select("station_id, stations(id, name, brand, city, area, petrol_status, diesel_status, petrol_eta, diesel_eta, updated_at)")
    .eq("user_id", user.id);

  type StationJoin = {
    id: string;
    name: string;
    brand: string;
    city: string;
    area: string;
    petrol_status: string;
    diesel_status: string;
    petrol_eta: string | null;
    diesel_eta: string | null;
    updated_at: string;
  };

  const stations = (staffRows ?? [])
    .flatMap((r) => {
      const s = r.stations as StationJoin | StationJoin[] | null;
      if (!s) return [];
      return Array.isArray(s) ? s : [s];
    });

  return { user, stations };
}

// ---------------------------------------------------------------------------
// getSuperAdminOrNull
// Non-redirecting variant for API route handlers.
// Returns the user if they are a super admin, otherwise null.
// ---------------------------------------------------------------------------
export async function getSuperAdminOrNull() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: adminRow } = await supabase
    .from("super_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return adminRow ? user : null;
}

// ---------------------------------------------------------------------------
// getUserOrNull
// Non-redirecting variant – returns the authenticated user or null.
// For API route handlers that return JSON errors instead of redirecting.
// ---------------------------------------------------------------------------
export async function getUserOrNull() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}
