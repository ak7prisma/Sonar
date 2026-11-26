import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { getPublicEnv, getSupabasePublicKey, isSupabaseConfigured } from "@/lib/env";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/courses",
  "/upload",
  "/reader",
  "/review",
  "/admin",
  "/settings",
];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  // Intercept OAuth callback codes if they land on the root "/" or any other non-callback page
  const authCode = request.nextUrl.searchParams.get("code");
  if (authCode && !pathname.startsWith("/auth/callback")) {
    const callbackRedirectUrl = request.nextUrl.clone();
    callbackRedirectUrl.pathname = "/auth/callback";
    if (!callbackRedirectUrl.searchParams.has("next")) {
      callbackRedirectUrl.searchParams.set("next", "/dashboard");
    }
    return NextResponse.redirect(callbackRedirectUrl);
  }

  const requiresAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  let hasAuth = false;

  // Check demo session cookie
  const demoRole = request.cookies.get("sonar_role")?.value;
  if (demoRole === "student" || demoRole === "volunteer" || demoRole === "admin") {
    hasAuth = true;
  }

  // Check Supabase session if configured
  if (isSupabaseConfigured()) {
    const env = getPublicEnv();
    const key = getSupabasePublicKey();

    if (env.NEXT_PUBLIC_SUPABASE_URL && key) {
      const supabase = createServerClient<Database>(
        env.NEXT_PUBLIC_SUPABASE_URL,
        key,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              );
              response = NextResponse.next({ request });
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              );
            },
          },
        }
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        hasAuth = true;
      }
    }
  }

  // Enforce authentication gate
  if (!hasAuth && requiresAuth) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
