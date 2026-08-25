"use client";

import { useEffect } from "react";
import { recordToolUsageAction } from "@/lib/usage/actions";

/** Invisible: records a tool use to Supabase for signed-in users (no-op for anonymous visitors — see recordToolUsageAction). */
export function UsageTracker({ toolId }: { toolId: string }) {
  useEffect(() => {
    recordToolUsageAction(toolId).catch(() => {
      // Never break the tool over a tracking failure.
    });
  }, [toolId]);

  return null;
}
