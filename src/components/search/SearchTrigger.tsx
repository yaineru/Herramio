"use client";

import { Search } from "lucide-react";
import { openSearchPalette } from "@/lib/search-events";
import { cn } from "@/lib/utils";

interface SearchTriggerProps {
  variant?: "compact" | "large";
  className?: string;
  placeholder?: string;
}

export function SearchTrigger({
  variant = "compact",
  className,
  placeholder = "Buscar herramientas...",
}: SearchTriggerProps) {
  if (variant === "large") {
    return (
      <button
        type="button"
        onClick={() => openSearchPalette()}
        className={cn(
          "group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm shadow-slate-900/[0.03] transition-all hover:border-slate-300 hover:shadow-md",
          className,
        )}
      >
        <Search className="h-5 w-5 shrink-0 text-slate-400 transition-colors group-hover:text-slate-600" />
        {/* slate-500, not slate-400: this reads as placeholder text but is
            the primary prompt of the whole page — slate-400 measures
            2.63:1 on white, far below the WCAG AA floor. */}
        <span className="flex-1 text-slate-500">¿Qué necesitas hacer?</span>
        <kbd className="hidden shrink-0 items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-400 sm:inline-flex">
          Ctrl K
        </kbd>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openSearchPalette()}
      aria-label="Buscar herramientas"
      className={cn(
        "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-600",
        className,
      )}
    >
      <Search className="h-4 w-4" />
      <span className="hidden md:inline">{placeholder}</span>
      <kbd className="hidden rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 md:inline-flex">
        Ctrl K
      </kbd>
    </button>
  );
}
