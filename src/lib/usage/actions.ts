"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

/**
 * Records one use of a tool for the current authenticated user — silent
 * no-op for anonymous visitors, since `tool_usage` only has meaning tied
 * to a real account (nothing to attribute anonymous usage to, and nothing
 * anonymous usage should be limited by). This is analytics/product-insight
 * data, not a gate: no tool currently checks this to allow/deny access.
 * Never throws — a tracking failure must never break the tool itself.
 */
export async function recordToolUsageAction(toolId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_tool_usage", {
    p_owner_type: "user",
    p_owner_id: user.id,
    p_tool_id: toolId,
  });

  if (error) console.error(`No se pudo registrar el uso de la herramienta ${toolId}:`, error);
}
