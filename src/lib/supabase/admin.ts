import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl, getSupabaseServiceRoleKey } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Admin client — uses the service role key, which bypasses Row Level
 * Security entirely. Only ever call this from trusted server code that has
 * already verified what it's doing: webhook handlers (Stripe confirmed the
 * event) and a small set of server actions that need to write data the
 * requesting user isn't allowed to write directly (e.g. accepting a
 * workspace invitation touches another user's membership row).
 *
 * Never import this into a Client Component. Never use it to skip an
 * authorization check you were too lazy to write with the regular client.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
