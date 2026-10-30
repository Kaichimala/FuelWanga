"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MALAWI_DISTRICTS } from "@/lib/malawi";

// ---------------------------------------------------------------------------
// Stations
// ---------------------------------------------------------------------------

export async function setStationActive(stationId: string, isActive: boolean) {
  await requireSuperAdmin();
  const parsed = z.string().uuid().safeParse(stationId);
  if (!parsed.success) return { error: "Invalid station ID." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("stations")
    .update({ is_active: isActive })
    .eq("id", stationId);

  if (error) return { error: "Failed to update station." };
  revalidatePath("/");
  revalidatePath("/admin");
  return null;
}

export async function deleteStation(stationId: string) {
  await requireSuperAdmin();
  const parsed = z.string().uuid().safeParse(stationId);
  if (!parsed.success) return { error: "Invalid station ID." };

  const supabase = await createClient();
  const { error } = await supabase.from("stations").delete().eq("id", stationId);
  if (error) return { error: "Failed to delete station." };
  revalidatePath("/");
  revalidatePath("/admin");
  return null;
}

const EditStationSchema = z.object({
  id: z.string().uuid(),
  brand: z.string().min(1).max(100),
  city: z.enum(MALAWI_DISTRICTS),
  area: z.string().min(1).max(100),
});

export async function editStation(input: unknown) {
  await requireSuperAdmin();
  const parsed = EditStationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { id, brand, city, area } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("stations").update({ brand, city, area }).eq("id", id);
  if (error) {
    if (error.code === "23505") return { error: "A station with that brand/city/area already exists." };
    return { error: "Failed to update station." };
  }
  revalidatePath("/");
  revalidatePath("/admin");
  return null;
}

// ---------------------------------------------------------------------------
// Invites
// ---------------------------------------------------------------------------

export async function revokeInvite(inviteId: string) {
  await requireSuperAdmin();
  const parsed = z.string().uuid().safeParse(inviteId);
  if (!parsed.success) return { error: "Invalid invite ID." };

  const supabase = await createClient();
  const { error } = await supabase.from("station_invites").delete().eq("id", inviteId);
  if (error) return { error: "Failed to revoke invite." };
  revalidatePath("/admin");
  return null;
}

// ---------------------------------------------------------------------------
// Brands
// ---------------------------------------------------------------------------

export async function addBrand(name: string) {
  await requireSuperAdmin();
  const parsed = z.string().min(1).max(100).safeParse(name.trim());
  if (!parsed.success) return { error: "Brand name is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("brands").insert({ name: parsed.data });
  if (error) {
    if (error.code === "23505") return { error: "That brand already exists." };
    return { error: "Failed to add brand." };
  }
  revalidatePath("/admin");
  return null;
}

export async function deactivateBrand(brandId: number) {
  await requireSuperAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("brands")
    .update({ is_active: false })
    .eq("id", brandId);
  if (error) return { error: "Failed to deactivate brand." };
  revalidatePath("/admin");
  return null;
}
