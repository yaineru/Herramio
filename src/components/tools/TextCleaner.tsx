"use client";

import { useState } from "react";
import { Check, Copy, Trash2, Wand2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { cleanText, type CleanTextOptions } from "@/lib/text/clean-text";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "texto-limpiar";

export function TextCleaner() {
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<CleanTextOptions>({
    removeDuplicateSpaces: true,
    removeEmptyLines: true,
    trimLines: true,
    textCase: "none",
  });
  const [output, setOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleClean() {
    if (!input) return;
    setOutput(cleanText(input, options));
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  function handleClear() {
    setInput("");
    setOutput(null);
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

  function toggle(key: keyof Omit<CleanTextOptions, "textCase">) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <Card className="p-6">
      <Label htmlFor="text-cleaner-input">Texto a limpiar</Label>
      <textarea
        id="text-cleaner-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Pega aquí el texto que quieres limpiar..."
        rows={8}
        className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={options.removeDuplicateSpaces} onChange={() => toggle("removeDuplicateSpaces")} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
          Quitar espacios duplicados
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={options.removeEmptyLines} onChange={() => toggle("removeEmptyLines")} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
          Quitar líneas vacías
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={options.trimLines} onChange={() => toggle("trimLines")} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
          Quitar espacios al inicio/final de cada línea
        </label>
        <div>
          <Select value={options.textCase} onChange={(e) => setOptions((prev) => ({ ...prev, textCase: e.target.value as CleanTextOptions["textCase"] }))} aria-label="Cambiar mayúsculas/minúsculas">
            <option value="none">Sin cambio de mayúsculas</option>
            <option value="upper">MAYÚSCULAS</option>
            <option value="lower">minúsculas</option>
            <option value="title">Primera Letra Mayúscula</option>
          </Select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" onClick={handleClean} disabled={!input}>
          <Wand2 className="h-4 w-4" /> Limpiar texto
        </Button>
        <Button type="button" variant="outline" onClick={handleCopy} disabled={!output}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado" : "Copiar resultado"}
        </Button>
        <Button type="button" variant="ghost" onClick={handleClear} disabled={!input}>
          <Trash2 className="h-4 w-4" /> Limpiar campo
        </Button>
      </div>

      {output !== null && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Resultado</p>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="whitespace-pre-line text-sm text-slate-800">{output || "(vacío)"}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
