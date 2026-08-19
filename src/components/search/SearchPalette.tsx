"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, ArrowUp, ArrowDown, X } from "lucide-react";
import { subscribeToSearchOpen } from "@/lib/search-events";
import { searchTools, findMatchingComingSoonCategory } from "@/lib/tools/search";
import { TOOLS } from "@/lib/tools/registry";
import { AnalyticsEvents } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const SUGGESTED_IDS = ["qr-whatsapp", "qr-wifi", "qr-url", "qr-vcard"];
const SUGGESTED = TOOLS.filter((t) => SUGGESTED_IDS.includes(t.id));

export function SearchPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevQuery, setPrevQuery] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim() ? searchTools(query) : SUGGESTED;
  const comingSoonCategory = query.trim() && results.length === 0 ? findMatchingComingSoonCategory(query) : undefined;

  // Reset the highlighted result whenever the query changes. Adjusting
  // state during render (React's recommended pattern for this) instead of
  // in a useEffect avoids an extra commit/render cycle.
  if (query !== prevQuery) {
    setPrevQuery(query);
    setActiveIndex(0);
  }

  useEffect(() => subscribeToSearchOpen((initialQuery) => {
    setQuery(initialQuery);
    setActiveIndex(0);
    setOpen(true);
  }), []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    // Debounced so we log one "search_used" per pause in typing, not one
    // per keystroke.
    const timeout = setTimeout(() => {
      AnalyticsEvents.searchUsed(trimmed, results.length);
    }, 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isShortcut = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isShortcut) {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const tool = results[activeIndex];
        if (tool) {
          setOpen(false);
          if (query.trim()) AnalyticsEvents.searchResultClicked(tool.id, query.trim());
          router.push(tool.href);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, results, activeIndex, router, query]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/50 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar herramientas"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-4">
          <Search className="h-4.5 w-4.5 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar herramientas... (QR, PDF, comprimir...)"
            className="h-14 w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            aria-label="Buscar herramientas"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar buscador"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {!query.trim() && (
            <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Sugeridas
            </p>
          )}

          {results.map((tool, i) => (
            <button
              key={tool.id}
              type="button"
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => {
                setOpen(false);
                if (query.trim()) AnalyticsEvents.searchResultClicked(tool.id, query.trim());
                router.push(tool.href);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                i === activeIndex ? "bg-slate-100" : "hover:bg-slate-50",
              )}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                <tool.icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-900">{tool.name}</span>
                <span className="block truncate text-xs text-slate-500">{tool.description}</span>
              </span>
            </button>
          ))}

          {query.trim() && results.length === 0 && (
            <div className="px-4 py-8 text-center">
              {comingSoonCategory ? (
                <>
                  <p className="text-sm font-medium text-slate-900">
                    {comingSoonCategory.name} está en camino
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Todavía no tenemos herramientas en esta categoría, pero están planeadas para
                    más adelante.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-900">
                    No encontramos esa herramienta todavía.
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    ¿Quieres que la creemos?{" "}
                    <a href="/contacto" className="font-medium text-emerald-700 underline">
                      Cuéntanos
                    </a>
                    .
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="hidden items-center gap-4 border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400 sm:flex">
          <span className="inline-flex items-center gap-1">
            <ArrowUp className="h-3 w-3" />
            <ArrowDown className="h-3 w-3" /> navegar
          </span>
          <span className="inline-flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" /> abrir
          </span>
          <span className="inline-flex items-center gap-1">Esc cerrar</span>
        </div>
      </div>
    </div>
  );
}
