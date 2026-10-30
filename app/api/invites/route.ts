import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { z } from "zod";
import { getSuperAdminOrNull } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MALAWI_DISTRICTS } from "@/lib/malawi";

// Simple in-memory rate limiter: max 20 requests per IP per 60 seconds.
// Resets on cold start – noted limitation for serverless.
const rateMap = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 20;
}

const InviteSchema = z.object({
  brand: z.string().min(1).max(100),
  city: z.enum(MALAWI_DISTRICTS),
  area: z.string().min(1).max(100),
});

/** Normalise area the same way the DB trigger does: initcap(btrim(regexp_replace(area,'\s+',' ','g'))) */
function normaliseArea(area: string): string {
  return area
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  // Auth: super admin only
  const user = await getSuperAdminOrNull();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = InviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const { brand, city } = parsed.data;
  const area = normaliseArea(parsed.data.area);

  const supabase = await createClient();

  // If the brand doesn't exist yet, create it automatically (custom brand path).
  // If it exists but is inactive, reject it.
  const { data: brandRow } = await supabase
    .from("brands")
    .select("id, is_active")
    .eq("name", brand)
    .maybeSingle();

  if (brandRow && !brandRow.is_active) {
    return NextResponse.json({ error: "That brand has been deactivated." }, { status: 400 });
  }

  if (!brandRow) {
    // New custom brand — insert it as active
    const { error: brandInsertError } = await supabase
      .from("brands")
      .insert({ name: brand, is_active: true });
    if (brandInsertError) {
      return NextResponse.json({ error: "Failed to create brand." }, { status: 500 });
    }
  }

  // Check station doesn't already exist
  const { data: existing } = await supabase
    .from("stations")
    .select("id")
    .eq("brand", brand)
    .eq("city", city)
    .eq("area", area)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "A station with this brand/city/area already exists." }, { status: 409 });
  }

  // Generate token and store only its hash
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const { error: insertError } = await supabase.from("station_invites").insert({
    token_hash: tokenHash,
    brand,
    city,
    area,
    created_by: user.id,
  });

  if (insertError) {
    return NextResponse.json({ error: "Failed to create invite." }, { status: 500 });
  }

  // Build URL from configured origin (never trust request origin blindly)
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const url = `${origin}/station/register?token=${token}`;

  return NextResponse.json({ url }, { status: 201 });
}
