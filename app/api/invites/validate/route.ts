import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Rate limiter: max 10 requests per IP per 60 seconds
const rateMap = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 10;
}

// NOTE: This route uses the admin client because station_invites has zero anon
// access by RLS policy. The route only returns brand/city/area – never the token
// or token_hash – so this is safe to expose publicly.
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token || token.length < 16) {
    return NextResponse.json({ error: "Invalid token." }, { status: 400 });
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");

  const { data: invite } = await supabaseAdmin
    .from("station_invites")
    .select("brand, city, area, used, expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!invite || invite.used || new Date(invite.expires_at) <= new Date()) {
    // Return a generic 400 – don't reveal whether the token exists
    return NextResponse.json({ error: "Invalid or expired invite." }, { status: 400 });
  }

  // Only return what the registration form needs
  return NextResponse.json({
    brand: invite.brand,
    city: invite.city,
    area: invite.area,
  });
}
