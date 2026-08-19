import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Tool } from "@/lib/tools/registry";

export function FloatingToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={tool.href}
      className="group relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white/90 p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/10 focus:-translate-y-1 focus:border-emerald-300 focus:shadow-xl focus:outline-none"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 group-focus:-rotate-6 group-focus:scale-110">
        <tool.icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-slate-900">{tool.name}</h3>
      <p className="mt-1 max-h-0 overflow-hidden text-xs leading-relaxed text-slate-500 opacity-0 transition-all duration-300 group-hover:mt-1.5 group-hover:max-h-24 group-hover:opacity-100 group-focus:mt-1.5 group-focus:max-h-24 group-focus:opacity-100">
        {tool.description}
      </p>
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus:opacity-100">
        Usar herramienta <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  );
}
