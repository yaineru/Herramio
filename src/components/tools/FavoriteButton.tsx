"use client";

import { useSyncExternalStore } from "react";
import { Star } from "lucide-react";
import {
  toggleFavorite,
  subscribeToFavorites,
  getFavoritesSnapshot,
  getFavoritesServerSnapshot,
} from "@/lib/favorites";
import { AnalyticsEvents } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function FavoriteButton({ toolId }: { toolId: string }) {
  // Reading the useSyncExternalStore return value (not a direct
  // localStorage read) keeps the very first client render identical to the
  // server-rendered markup — otherwise React flags a hydration mismatch.
  const snapshot = useSyncExternalStore(subscribeToFavorites, getFavoritesSnapshot, getFavoritesServerSnapshot);
  const active = snapshot.split(",").includes(toolId);

  function handleClick() {
    const nowFavorite = toggleFavorite(toolId);
    if (nowFavorite) AnalyticsEvents.favoriteAdded(toolId);
    else AnalyticsEvents.favoriteRemoved(toolId);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? "Quitar de favoritos" : "Añadir a favoritos"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border transition",
        active
          ? "border-amber-300 bg-amber-50 text-amber-500"
          : "border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600",
      )}
    >
      <Star className="h-4 w-4" fill={active ? "currentColor" : "none"} />
    </button>
  );
}
