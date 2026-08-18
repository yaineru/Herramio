"use client";

import { useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { ToolGrid } from "@/components/marketing/ToolGrid";
import { CATEGORIES, type CategoryId } from "@/lib/tools/categories";
import { TOOLS } from "@/lib/tools/registry";
import { searchTools } from "@/lib/tools/search";
import { cn } from "@/lib/utils";

type CategoryFilter = CategoryId | "todas";
type SortOrder = "relevancia" | "az";

interface ToolCatalogProps {
  initialQuery?: string;
  initialCategory?: CategoryFilter;
}

export function ToolCatalog({ initialQuery = "", initialCategory = "todas" }: ToolCatalogProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<CategoryFilter>(initialCategory);
  const [sort, setSort] = useState<SortOrder>("relevancia");

  const comingSoonCategory =
    category !== "todas" ? CATEGORIES.find((c) => c.id === category && c.status === "coming-soon") : undefined;

  const scoped = category === "todas" ? TOOLS : TOOLS.filter((t) => t.category === category);
  const filtered = query.trim() ? searchTools(query, scoped) : scoped;
  const results = sort === "az" ? [...filtered].sort((a, b) => a.name.localeCompare(b.name, "es")) : filtered;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, categoría o palabra clave..."
            className="pl-10"
            aria-label="Buscar herramientas"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOrder)}
          className="h-11 shrink-0 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          aria-label="Ordenar herramientas"
        >
          <option value="relevancia">Más usadas</option>
          <option value="az">A-Z</option>
        </select>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <CategoryChip active={category === "todas"} onClick={() => setCategory("todas")}>
          Todas
        </CategoryChip>
        {CATEGORIES.map((c) => (
          <CategoryChip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
            {c.name}
            {c.status === "coming-soon" && (
              <span className="ml-1.5 text-[10px] text-amber-600">pronto</span>
            )}
          </CategoryChip>
        ))}
      </div>

      <div className="mt-8">
        {comingSoonCategory ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
            <comingSoonCategory.icon className="mx-auto h-8 w-8 text-slate-400" strokeWidth={1.5} />
            <p className="mt-4 font-semibold text-slate-900">{comingSoonCategory.name} está en camino</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
              Todavía no tenemos herramientas en esta categoría, pero están planeadas para más
              adelante. ¿Necesitas una ya?{" "}
              <a href="/contacto" className="font-medium text-emerald-700 underline">
                Cuéntanos
              </a>
              .
            </p>
          </div>
        ) : results.length > 0 ? (
          <ToolGrid tools={results} />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
            <p className="font-semibold text-slate-900">No encontramos esa herramienta todavía.</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
              ¿Quieres que la creemos?{" "}
              <a href="/contacto" className="font-medium text-emerald-700 underline">
                Cuéntanos qué necesitas
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
      )}
    >
      {children}
    </button>
  );
}
