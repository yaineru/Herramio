"use client";

import { useSyncExternalStore } from "react";
import { subscribeToHistory, getHistorySnapshot, getHistoryServerSnapshot, type HistoryEntry } from "@/lib/history";
import { getToolById, type Tool } from "@/lib/tools/registry";
import { ToolGrid } from "@/components/marketing/ToolGrid";

const MAX_SHOWN = 3;

/**
 * Renders nothing for new visitors and nothing during server render (the
 * server snapshot is always "[]") — this section only exists in the DOM
 * once a returning visitor's browser has real history to show, so it never
 * costs a new visitor (the vast majority of organic traffic) any layout
 * space or a crawler any confusing "empty" markup.
 */
export function ContinueWhereYouLeftOff() {
  const historySnapshot = useSyncExternalStore(subscribeToHistory, getHistorySnapshot, getHistoryServerSnapshot);
  const history: HistoryEntry[] = JSON.parse(historySnapshot);

  const tools = history
    .slice(0, MAX_SHOWN)
    .map((entry) => getToolById(entry.slug))
    .filter((t): t is Tool => Boolean(t));

  if (tools.length === 0) return null;

  return (
    <section className="container-page py-10">
      <h2 className="text-2xl font-bold text-slate-900">Continúa donde lo dejaste</h2>
      <p className="mt-1 text-slate-500">Las últimas herramientas que usaste, guardadas solo en este navegador.</p>
      <div className="mt-8">
        <ToolGrid tools={tools} />
      </div>
    </section>
  );
}
