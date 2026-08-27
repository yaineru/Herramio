"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/tools/categories";
import { getToolsByCategory } from "@/lib/tools/registry";
import { AnalyticsEvents } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function CategoryGrid() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-slate-50 p-4 elevation-brand sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-kicker">Producto estrella</p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-900">Originalidad</h3>
          </div>
          <Link
            href="/originalidad"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
          >
            Revisar texto
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {CATEGORIES.map((category) => {
          const count = getToolsByCategory(category.id).length;
          const isComingSoon = category.status === "coming-soon";
          return (
            <Link
              key={category.id}
              href={isComingSoon ? "/herramientas" : `/categoria/${category.id}`}
              onClick={() => AnalyticsEvents.categorySelected(category.id)}
              className={cn(
                "group flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 elevation-1 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:elevation-brand",
              )}
            >
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200",
                  isComingSoon ? "bg-slate-100 text-slate-400" : "bg-slate-950 text-white group-hover:bg-emerald-600",
                )}
              >
                <category.icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="w-full">
                <span className="block text-sm font-semibold text-slate-900">{category.name}</span>
                <span
                  className={cn(
                    "mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium",
                    isComingSoon ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700",
                  )}
                >
                  {isComingSoon ? "Próximamente" : `${count} herramienta${count === 1 ? "" : "s"}`}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
