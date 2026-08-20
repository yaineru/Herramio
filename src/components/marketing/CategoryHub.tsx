"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/tools/categories";
import { getToolsByCategory } from "@/lib/tools/registry";
import { AnalyticsEvents } from "@/lib/analytics";
import { cn } from "@/lib/utils";

// One representative tool per category, curated for variety rather than
// always picking the first entry (which skews heavily QR-flavored).
const FEATURED_TOOL_ID: Record<string, string> = {
  qr: "qr-whatsapp",
  pdf: "pdf-unir",
  imagenes: "imagen-comprimir",
  calculadoras: "calc-porcentaje",
  convertidores: "conv-unidades",
  texto: "texto-generador-contrasenas",
  desarrolladores: "dev-json-formatter",
  productividad: "productividad-temporizador",
};

export function CategoryHub() {
  const [activeId, setActiveId] = useState(CATEGORIES[0].id);
  const active = CATEGORIES.find((c) => c.id === activeId) ?? CATEGORIES[0];
  const tools = getToolsByCategory(active.id);
  const featuredId = FEATURED_TOOL_ID[active.id];
  const featured = tools.find((t) => t.id === featuredId) ?? tools[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
      <div
        role="tablist"
        aria-label="Categorías de Herramio"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2"
      >
        {CATEGORIES.map((category) => {
          const isActive = category.id === activeId;
          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onMouseEnter={() => setActiveId(category.id)}
              onFocus={() => setActiveId(category.id)}
              onClick={() => setActiveId(category.id)}
              className={cn(
                "flex min-w-0 flex-col items-start gap-2 rounded-2xl border p-3 text-left transition-colors duration-150 sm:p-4",
                isActive
                  ? "border-emerald-300 bg-emerald-50/60 shadow-sm shadow-emerald-900/5"
                  : "border-slate-200 bg-white hover:border-slate-300",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                  isActive ? "bg-emerald-600 text-white" : "bg-slate-900 text-white",
                )}
              >
                <category.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
              </span>
              <span className="w-full min-w-0 truncate text-sm font-semibold text-slate-900">{category.name}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <active.icon className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
              {tools.length} herramienta{tools.length === 1 ? "" : "s"}
            </p>
            <h3 className="text-xl font-bold text-slate-900">{active.name}</h3>
          </div>
        </div>
        <p className="mt-4 text-slate-500">{active.description}</p>

        {featured && (
          <Link
            href={featured.href}
            onClick={() => AnalyticsEvents.ctaClicked(`hub_featured_${featured.id}`)}
            className="group mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-md"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-700">
              <featured.icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">Destacada</span>
              <span className="block truncate font-medium text-slate-900">{featured.name}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
          </Link>
        )}

        <Link
          href={`/categoria/${active.id}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-900 hover:underline"
        >
          Ver todas en {active.name} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
