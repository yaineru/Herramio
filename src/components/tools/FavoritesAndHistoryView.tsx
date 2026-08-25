"use client";

import { useState, useSyncExternalStore } from "react";
import { Star, History, Trash2 } from "lucide-react";
import Link from "next/link";
import { ToolGrid } from "@/components/marketing/ToolGrid";
import { Button } from "@/components/ui/Button";
import {
  subscribeToFavorites,
  getFavoritesSnapshot,
  getFavoritesServerSnapshot,
} from "@/lib/favorites";
import {
  clearHistory,
  subscribeToHistory,
  getHistorySnapshot,
  getHistoryServerSnapshot,
  type HistoryEntry,
} from "@/lib/history";
import { getToolById, type Tool } from "@/lib/tools/registry";
import { useFavoritesLimit } from "@/components/providers/EntitlementsProvider";
import { cn } from "@/lib/utils";

type Tab = "favoritos" | "recientes";

function relativeTime(timestamp: number): string {
  const diffSec = Math.round((timestamp - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(diffSec, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  return rtf.format(Math.round(diffSec / 86400), "day");
}

export function FavoritesAndHistoryView() {
  const [tab, setTab] = useState<Tab>("favoritos");

  // Deriving lists from the useSyncExternalStore return value (rather than
  // reading localStorage directly) keeps the first client render identical
  // to the server-rendered markup, avoiding a hydration mismatch.
  const favoritesSnapshot = useSyncExternalStore(subscribeToFavorites, getFavoritesSnapshot, getFavoritesServerSnapshot);
  const historySnapshot = useSyncExternalStore(subscribeToHistory, getHistorySnapshot, getHistoryServerSnapshot);

  const favoriteTools = (favoritesSnapshot ? favoritesSnapshot.split(",") : [])
    .map((id) => getToolById(id))
    .filter((t): t is Tool => Boolean(t));
  const history: HistoryEntry[] = JSON.parse(historySnapshot);
  const favoritesLimit = useFavoritesLimit();

  return (
    <div>
      {tab === "favoritos" && favoritesLimit !== null && (
        <p className="mb-3 text-xs text-slate-400">
          {favoriteTools.length}/{favoritesLimit} favoritos usados en el plan Gratis —{" "}
          <Link href="/precios" className="font-medium text-emerald-600 hover:underline">
            pasa a Pro para favoritos ilimitados
          </Link>
          .
        </p>
      )}
      <div className="mb-6 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setTab("favoritos")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition",
            tab === "favoritos" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500",
          )}
        >
          <Star className="h-3.5 w-3.5" /> Favoritos
        </button>
        <button
          type="button"
          onClick={() => setTab("recientes")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition",
            tab === "recientes" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500",
          )}
        >
          <History className="h-3.5 w-3.5" /> Recientes
        </button>
      </div>

      {tab === "favoritos" && (
        favoriteTools.length > 0 ? (
          <ToolGrid tools={favoriteTools} />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
            <Star className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              Aún no tienes herramientas favoritas. Pulsa la estrella en cualquier herramienta para guardarla aquí.
            </p>
            <Link href="/herramientas" className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:underline">
              Explorar herramientas
            </Link>
          </div>
        )
      )}

      {tab === "recientes" && (
        history.length > 0 ? (
          <div>
            <div className="mb-4 flex justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={clearHistory}>
                <Trash2 className="h-4 w-4" /> Borrar historial
              </Button>
            </div>
            <ul className="space-y-2">
              {history.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={`/${entry.slug}`}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition hover:border-slate-300 hover:shadow-sm"
                  >
                    <span className="font-medium text-slate-900">{entry.name}</span>
                    <span className="text-xs text-slate-400">{relativeTime(entry.timestamp)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
            <History className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">Todavía no has visitado ninguna herramienta.</p>
            <Link href="/herramientas" className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:underline">
              Explorar herramientas
            </Link>
          </div>
        )
      )}
    </div>
  );
}
