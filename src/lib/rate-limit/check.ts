import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Sliding-window rate limit backed by `check_and_record_rate_limit()` (see
 * 0004_rate_limiting.sql). Fails OPEN on any infrastructure error — a
 * Supabase hiccup must never lock real users out of signing in; the
 * downside of failing open is bounded (worst case, temporarily no rate
 * limiting), while failing closed would turn a transient DB blip into a
 * full auth outage.
 */
export async function checkRateLimit(bucket: string, maxEvents: number, windowSeconds: number): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("check_and_record_rate_limit", {
      p_bucket: bucket,
      p_max_events: maxEvents,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.error("Rate limit check failed (failing open):", error);
      return true;
    }
    return data === true;
  } catch (error) {
    console.error("Rate limit check threw (failing open):", error);
    return true;
  }
}

/** Best-effort client IP from the proxy chain — Vercel sets x-forwarded-for reliably; falls back to a shared bucket if absent (e.g. local dev). */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}
