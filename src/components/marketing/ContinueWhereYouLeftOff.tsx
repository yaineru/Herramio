"use client";

import { useSyncExternalStore } from "react";
import { subscribeToFavorites, getFavoritesSnapshot, getFavoritesServerSnapshot } from "@/lib/favorites";
import { subscribeToHistory, getHistorySnapshot, getHistoryServerSnapshot, type HistoryEntry } from "@/lib/history";
import { getToolById, type Tool } from "@/lib/tools/registry";
import { ToolGrid } from "@/components/marketing/ToolGrid";

const MAX_SHOWN = 6;

/**
 * Renders nothing for new visitors and nothing during server render (both
 * server snapshots are always empty) — this section only exists in the DOM
 * once a returning visitor's browser has real favorites or history to show,
 * so it never costs a new visitor (the vast majority of organic traffic)
 * any layout space or a crawler any confusing "empty" markup. Favorites are
 * an intentional save, so they're listed first; recent history fills the
 * remaining slots, skipping anything already shown as a favorite.
 */
export function ContinueWhereYouLeftOff() {
  const favoritesSnapshot = useSyncExternalStore(subscribeToFavorites, getFavoritesSnapshot, getFavoritesServerSnapshot);
  const historySnapshot = useSyncExternalStore(subscribeToHistory, getHistorySnapshot, getHistoryServerSnapshot);

  const favoriteIds = favoritesSnapshot ? favoritesSnapshot.split(",") : [];
  const history: HistoryEntry[] = JSON.parse(historySnapshot);
  const recentIds = history.map((entry) => entry.slug).filter((slug) => !favoriteIds.includes(slug));

  const tools = [...favoriteIds, ...recentIds]
    .slice(0, MAX_SHOWN)
    .map((id) => getToolById(id))
    .filter((t): t is Tool => Boolean(t));

  if (tools.length === 0) return null;

  return (
    <section className="container-page py-10">
      <h2 className="text-2xl font-bold text-slate-900">Tus favoritos y recientes</h2>
      <p className="mt-1 text-slate-500">Guardado solo en este navegador — vuelve directo a lo que ya usaste.</p>
      <div className="mt-8">
        <ToolGrid tools={tools} />
      </div>
    </section>
  );
}
