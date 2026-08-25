import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Server-side Supabase client (Server Components, Server Actions, Route
 * Handlers) — reads the user's session from cookies, so RLS policies see
 * the real `auth.uid()`. The `setAll` call throws when invoked from a plain
 * Server Component (cookies are read-only there); that's expected and safe
 * to ignore because `middleware.ts` already refreshes the session cookie on
 * every request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component render — middleware.ts handles refresh instead.
        }
      },
    },
  });
}
