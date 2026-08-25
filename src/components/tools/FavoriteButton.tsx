"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import {
  toggleFavorite,
  getFavorites,
  subscribeToFavorites,
  getFavoritesSnapshot,
  getFavoritesServerSnapshot,
} from "@/lib/favorites";
import { useFavoritesLimit } from "@/components/providers/EntitlementsProvider";
import { AnalyticsEvents } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function FavoriteButton({ toolId }: { toolId: string }) {
  // Reading the useSyncExternalStore return value (not a direct
  // localStorage read) keeps the very first client render identical to the
  // server-rendered markup — otherwise React flags a hydration mismatch.
  const snapshot = useSyncExternalStore(subscribeToFavorites, getFavoritesSnapshot, getFavoritesServerSnapshot);
  const active = snapshot.split(",").includes(toolId);
  const favoritesLimit = useFavoritesLimit();
  const [limitReached, setLimitReached] = useState(false);

  function handleClick() {
    // Only the "add" direction can hit a limit — removing a favorite is
    // always allowed regardless of plan.
    if (!active && favoritesLimit !== null && getFavorites().length >= favoritesLimit) {
      setLimitReached(true);
      AnalyticsEvents.paywallShown("favorites_limit");
      return;
    }
    setLimitReached(false);

    const nowFavorite = toggleFavorite(toolId);
    if (nowFavorite) AnalyticsEvents.favoriteAdded(toolId);
    else AnalyticsEvents.favoriteRemoved(toolId);
  }

  return (
    <div className="relative inline-block">
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

      {limitReached && (
        <div className="absolute right-0 top-full z-10 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-lg shadow-slate-900/[0.08]">
          Alcanzaste el límite de {favoritesLimit} favoritos del plan Gratis.{" "}
          <Link href="/precios" className="font-medium text-emerald-600 hover:underline">
            Pasa a Pro para favoritos ilimitados
          </Link>
          .
        </div>
      )}
    </div>
  );
}
