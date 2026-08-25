import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface ToolUsageSummary {
  toolId: string;
  count: number;
}

/**
 * Aggregates the last `days` of this user's own tool_usage rows client-side
 * (Supabase's REST layer doesn't do arbitrary GROUP BY) — fine at this
 * scale, one user's rows over 30 days is a handful, never worth a
 * dedicated Postgres function. RLS (`tool_usage_select_own`) already
 * guarantees this can only ever return the caller's own data.
 */
export const getUsageSummaryForUser = cache(async (userId: string, days = 30): Promise<ToolUsageSummary[]> => {
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("tool_usage")
    .select("tool_id, count")
    .eq("owner_type", "user")
    .eq("owner_id", userId)
    .gte("usage_date", since);

  if (error || !data) return [];

  const totals = new Map<string, number>();
  for (const row of data) {
    totals.set(row.tool_id, (totals.get(row.tool_id) ?? 0) + row.count);
  }

  return [...totals.entries()]
    .map(([toolId, count]) => ({ toolId, count }))
    .sort((a, b) => b.count - a.count);
});
