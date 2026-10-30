import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Routes that don't require a session inside /station
const STATION_PUBLIC_PATHS = [
  "/station/login",
  "/station/register",
  "/station/forgot-password",
  "/station/update-password",
];

// Routes that don't require a session inside /admin
const ADMIN_PUBLIC_PATHS = ["/admin/login"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not call getSession() for auth checks – use getUser().
  // getSession() reads from the cookie without verifying against the server.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ----- /station/** protection -----
  if (
    pathname.startsWith("/station") &&
    !STATION_PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  ) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/station/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  // ----- /admin/** protection -----
  if (
    pathname.startsWith("/admin") &&
    !ADMIN_PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  ) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  // NOTE: middleware is UX only. Real authorization checks (is_super_admin,
  // is_station_staff) happen in pages, server actions, and API routes.
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
