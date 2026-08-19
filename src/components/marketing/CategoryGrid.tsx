"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/tools/categories";
import { getToolsByCategory } from "@/lib/tools/registry";
import { AnalyticsEvents } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {CATEGORIES.map((category) => {
        const count = getToolsByCategory(category.id).length;
        const isComingSoon = category.status === "coming-soon";
        return (
          <Link
            key={category.id}
            href={`/herramientas?categoria=${category.id}`}
            onClick={() => AnalyticsEvents.categorySelected(category.id)}
            className={cn(
              "group flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5",
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                isComingSoon ? "bg-slate-100 text-slate-400" : "bg-slate-900 text-white group-hover:bg-emerald-600",
              )}
            >
              <category.icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="text-sm font-semibold text-slate-900">{category.name}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                isComingSoon ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-700",
              )}
            >
              {isComingSoon ? "Próximamente" : `${count} herramienta${count === 1 ? "" : "s"}`}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
