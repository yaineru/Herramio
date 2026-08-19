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
        className="group relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white transition-colors group-hover:bg-emerald-600">
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium tracking-wide text-slate-500 uppercase">
            {category.name}
          </span>
        </div>
        <h3 className="mt-4 font-semibold text-slate-900">{tool.name}</h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">{tool.description}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-900">
          Usar herramienta
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </TiltWrapper>
  );
}
