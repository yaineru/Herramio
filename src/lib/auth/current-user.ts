import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * The current authenticated user, or null. Cached per request so every
 * Server Component on a page can call this without N separate round trips
 * to Supabase Auth.
 *
 * Uses `auth.getUser()`, not `auth.getSession()` — getSession() trusts the
 * (client-supplied) cookie payload as-is, while getUser() revalidates the
 * token against Supabase Auth on every call. For anything used to gate
 * access, that revalidation is the difference between real auth and a
 * cookie a user could forge offline.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
