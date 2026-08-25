"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/database.types";

/** Browser-side Supabase client for Client Components. Auth state lives in cookies (via @supabase/ssr) so it's shared with the server. */
export function createClient() {
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
}
