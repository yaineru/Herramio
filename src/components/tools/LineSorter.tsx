"use client";

import { useState } from "react";
import { Check, Copy, ArrowDownAZ } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { processLines, type LineSortMode } from "@/lib/text/sort-lines";
import { cn } from "@/lib/utils";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "texto-ordenar-lineas";

export function LineSorter() {
  const [input, setInput] = useState("");
  const [sort, setSort] = useState<LineSortMode>("asc");
  const [dedupe, setDedupe] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [copied, setCopied] = useState(false);

  const output = input ? processLines(input, { sort, dedupe, removeEmpty }) : "";
  const inputLineCount = input ? input.split(/\r\n|\r|\n/).length : 0;
  const outputLineCount = output ? output.split("\n").length : 0;

  function handleChange(value: string) {
    setInput(value);
    if (value) AnalyticsEvents.toolUsed(TOOL_ID);
  }

  async function handleCopy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <Card className="p-6">
      <Label htmlFor="line-sorter-input">Lista de líneas</Label>
      <Textarea
        id="line-sorter-input"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={"linea 3\nlinea 1\nlinea 1\nlinea 2"}
        className="min-h-40 font-mono text-sm"
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          {(
            [
              { value: "none", label: "Sin ordenar" },
              { value: "asc", label: "A → Z" },
              { value: "desc", label: "Z → A" },
            ] as { value: LineSortMode; label: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSort(opt.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                sort === opt.value ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={dedupe} onChange={() => setDedupe((v) => !v)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
          Quitar duplicadas
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={removeEmpty} onChange={() => setRemoveEmpty((v) => !v)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
          Quitar líneas vacías
        </label>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Resultado {input && `(${inputLineCount} → ${outputLineCount} líneas)`}
          </p>
          {output && (
            <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          )}
        </div>
        {output ? (
          <pre className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm whitespace-pre-wrap text-slate-800">
            {output}
          </pre>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            <ArrowDownAZ className="mx-auto mb-2 h-5 w-5 text-slate-300" />
            Pega una lista de líneas para ordenarla o limpiarla.
          </p>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Todo ocurre en tu navegador; el texto que pegas nunca se envía a ningún servidor.
      </p>
    </Card>
  );
}
