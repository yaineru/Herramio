"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { searchHttpStatusCodes, type HttpStatusEntry } from "@/lib/dev/http-status";
import { AnalyticsEvents } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const TOOL_ID = "dev-http-status";

const CATEGORY_STYLES: Record<HttpStatusEntry["category"], string> = {
  "1xx": "bg-slate-100 text-slate-700",
  "2xx": "bg-emerald-100 text-emerald-700",
  "3xx": "bg-blue-100 text-blue-700",
  "4xx": "bg-amber-100 text-amber-700",
  "5xx": "bg-red-100 text-red-700",
};

export function HttpStatusLookup() {
  const [query, setQuery] = useState("");

  function handleChange(value: string) {
    setQuery(value);
    if (value.trim() !== "") AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const results = searchHttpStatusCodes(query);

  return (
    <Card className="p-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Buscar por código o palabra (ej. 404, redirección, autenticación)"
          className="pl-10"
        />
      </div>

      <div className="mt-5 grid gap-2">
        {results.length === 0 && <p className="text-sm text-slate-400">No se encontraron códigos que coincidan.</p>}
        {results.map((entry) => (
          <div key={entry.code} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className={cn("mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 font-mono text-sm font-bold", CATEGORY_STYLES[entry.category])}>
              {entry.code}
            </span>
            <div className="min-w-0">
              <p className="font-medium text-slate-900">{entry.name}</p>
              <p className="text-sm text-slate-500">{entry.description}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 text-xs text-slate-400">
        Lista de referencia de los códigos de estado HTTP más comunes, calculada en tu navegador.
      </p>
    </Card>
  );
}
