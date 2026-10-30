// ⚠️ SERVER-ONLY – this is the only route besides validate that uses the admin client.
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Rate limiter: max 5 registration attempts per IP per 10 minutes
const rateMap = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 600_000 });
    return false;
  }
  entry.count++;
  return entry.count > 5;
}

const RegisterSchema = z.object({
  token: z.string().min(16),
  email: z.string().email(),
  // DB trigger and Supabase auth both enforce length; zod is the first gate.
  password: z.string().min(10, "Password must be at least 10 characters."),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const { token, email, password } = parsed.data;
  // brand/city/area come only from the invite row – never from client input
  const tokenHash = createHash("sha256").update(token).digest("hex");

  // Step 1: Atomically claim the invite
  const { data: inviteRows, error: claimError } = await supabaseAdmin
    .from("station_invites")
    .update({ used: true, used_at: new Date().toISOString() })
    .eq("token_hash", tokenHash)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .select("id, brand, city, area, expires_at")
    .limit(1);

  if (claimError || !inviteRows || inviteRows.length === 0) {
    return NextResponse.json(
      { error: "This invite is invalid or has expired." },
      { status: 400 },
    );
  }

  const invite = inviteRows[0]!;
  const { id: inviteId, brand, city, area } = invite;

  // Step 2: Verify the brand is still active (re-check after claiming).
  // Custom brands are created as active by the invite route, so this
  // catches the edge case where a brand was deactivated between invite
  // creation and registration.
  const { data: brandRow } = await supabaseAdmin
    .from("brands")
    .select("id, is_active")
    .eq("name", brand)
    .maybeSingle();

  if (!brandRow) {
    // Brand was deleted entirely — un-claim the invite
    await supabaseAdmin
      .from("station_invites")
      .update({ used: false, used_at: null })
      .eq("id", inviteId);
    return NextResponse.json({ error: "Brand no longer exists." }, { status: 400 });
  }

  if (!brandRow.is_active) {
    // Un-claim the invite so it can be reissued
    await supabaseAdmin
      .from("station_invites")
      .update({ used: false, used_at: null })
      .eq("id", inviteId);
    return NextResponse.json({ error: "Brand is no longer active." }, { status: 400 });
  }

  // Step 3: Create the auth user (email_confirm: true – invite is the trust anchor)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    // Un-claim the invite
    await supabaseAdmin
      .from("station_invites")
      .update({ used: false, used_at: null })
      .eq("id", inviteId);
    return NextResponse.json(
      { error: "Failed to create account. The email may already be registered." },
      { status: 400 },
    );
  }

  const newUserId = authData.user.id;

  // Step 4: Insert the station
  const { data: stationData, error: stationError } = await supabaseAdmin
    .from("stations")
    .insert({ brand, city, area, created_by: newUserId })
    .select("id")
    .single();

  if (stationError || !stationData) {
    // Rollback: delete auth user, un-claim invite
    await supabaseAdmin.auth.admin.deleteUser(newUserId);
    await supabaseAdmin
      .from("station_invites")
      .update({ used: false, used_at: null })
      .eq("id", inviteId);

    if (stationError?.code === "23505") {
      return NextResponse.json({ error: "This station is already registered." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to register station." }, { status: 500 });
  }

  // Step 5: Insert station_staff link
  const { error: staffError } = await supabaseAdmin
    .from("station_staff")
    .insert({ station_id: stationData.id, user_id: newUserId });

  if (staffError) {
    // Rollback everything
    await supabaseAdmin.from("stations").delete().eq("id", stationData.id);
    await supabaseAdmin.auth.admin.deleteUser(newUserId);
    await supabaseAdmin
      .from("station_invites")
      .update({ used: false, used_at: null })
      .eq("id", inviteId);
    return NextResponse.json({ error: "Failed to link staff to station." }, { status: 500 });
  }

  // Step 6: Record who used the invite
  await supabaseAdmin
    .from("station_invites")
    .update({ used_by: newUserId })
    .eq("id", inviteId);

  return NextResponse.json({ ok: true });
}
