"use client";

import { useEffect } from "react";
import { addToHistory } from "@/lib/history";

/** Invisible: records a tool visit (slug, name, timestamp only) to localStorage history. */
export function HistoryTracker({ toolId, toolName }: { toolId: string; toolName: string }) {
  useEffect(() => {
    addToHistory(toolId, toolName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId]);

  return null;
}
