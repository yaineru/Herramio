import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Tool } from "@/lib/tools/registry";
import { getCategory } from "@/lib/tools/categories";
import { TiltWrapper } from "@/components/marketing/TiltWrapper";

export function ToolCard({ tool }: { tool: Tool }) {
  const category = getCategory(tool.category);
  const Icon = tool.icon;

  return (
    <TiltWrapper>
      <Link
        href={tool.href}
        className="group relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white/90 p-5 elevation-1 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:elevation-brand"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white transition-colors group-hover:bg-emerald-600">
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
            {category.name}
          </span>
        </div>
        <h3 className="mt-4 text-base font-semibold tracking-[-0.02em] text-slate-900">{tool.name}</h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">{tool.description}</p>
        <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm font-medium text-slate-900 transition group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-700">
          Usar herramienta
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </TiltWrapper>
  );
}
