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
          "group flex w-full items-center gap-3 rounded-[22px] border border-slate-200 bg-white/90 px-5 py-4 text-left shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-all duration-200 hover:border-slate-300 hover:shadow-[0_24px_52px_rgba(15,23,42,0.12)]",
          className,
        )}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-100">
          <Search className="h-4 w-4" />
        </span>
        <span className="flex-1 text-base font-medium text-slate-600">¿Qué necesitas hacer?</span>
        <kbd className="hidden shrink-0 items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-500 sm:inline-flex">
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
