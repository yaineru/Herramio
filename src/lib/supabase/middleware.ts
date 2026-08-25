import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/env";

/**
 * Refreshes the Supabase auth session on every request that passes through
 * middleware.ts, so a Server Component never sees a stale/expired token.
 * This is the ONLY thing middleware does for auth — it does not gate
 * routes. Route-level authorization (is this a Pro-only page, is this
 * workspace theirs) happens in the page/action itself via
 * `getCurrentUser()`/`getEntitlements()`, which is easier to keep correct
 * and test than a growing list of path patterns in middleware.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Touches the session so an expired access token gets refreshed via the
  // refresh token before any Server Component reads it.
  await supabase.auth.getUser();

  return response;
}
