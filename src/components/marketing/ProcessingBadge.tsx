import { ShieldCheck, Globe } from "lucide-react";

/**
 * Reads straight from the registry's `processing` field (see registry.ts) —
 * never a hardcoded claim, so it can't go stale or overstate what a tool
 * actually does. Only one tool today (conv-moneda) renders the "external"
 * variant.
 */
export function ProcessingBadge({ local }: { local: boolean }) {
  if (local) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <ShieldCheck className="h-3.5 w-3.5" /> Se procesa en tu navegador
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
      <Globe className="h-3.5 w-3.5" /> Requiere conexión a internet
    </span>
  );
}
