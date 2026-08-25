import type { Entitlements } from "@/lib/plans/types";

export interface UsageLimitResult {
  allowed: boolean;
  /** null means unlimited — there is no ceiling to report. */
  limit: number | null;
  /** null when `limit` is null. */
  remaining: number | null;
}

/**
 * Reads a numeric limit out of `entitlements.metadata[limitKey]` and
 * compares it against `currentCount`. The limit itself always comes from
 * the plan row (via metadata) — this function never hardcodes a number
 * for any plan. Missing key, `null`, or a non-number value all mean
 * "unlimited" (the safe direction to default a misconfigured or
 * not-yet-set limit, matching the project's "fail toward permissive, not
 * toward a fake restriction" rule for anything that isn't billing state).
 */
export function checkUsageLimit(
  entitlements: Entitlements,
  limitKey: string,
  currentCount: number,
): UsageLimitResult {
  const raw = entitlements.metadata[limitKey];
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return { allowed: true, limit: null, remaining: null };
  }

  const remaining = Math.max(raw - currentCount, 0);
  return { allowed: currentCount < raw, limit: raw, remaining };
}
