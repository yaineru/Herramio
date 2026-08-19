"use client";

import { useState } from "react";
import { ArrowLeftRight, Check, Copy, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { csvToJson, jsonToCsv } from "@/lib/dev/csv-json";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "dev-csv-json";

type Mode = "csv-to-json" | "json-to-csv";

export function CsvJsonConverter() {
  const [mode, setMode] = useState<Mode>("csv-to-json");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function run() {
    if (!input.trim()) return;
    const result = mode === "csv-to-json" ? csvToJson(input) : jsonToCsv(input);
    if (result.ok) {
      setOutput(result.value);
      setError(null);
      AnalyticsEvents.toolUsed(TOOL_ID);
    } else {
      setOutput("");
      setError(result.error);
      AnalyticsEvents.toolError(TOOL_ID, result.error);
    }
  }

  function handleSwap() {
    const nextMode: Mode = mode === "csv-to-json" ? "json-to-csv" : "csv-to-json";
    setMode(nextMode);
    setInput(output);
    setOutput("");
    setError(null);
  }

  function handleClear() {
    setInput("");
    setOutput("");
    setError(null);
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
      <div className="mb-4 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setMode("csv-to-json")}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${mode === "csv-to-json" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
        >
          CSV → JSON
        </button>
        <button
          type="button"
          onClick={() => setMode("json-to-csv")}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${mode === "json-to-csv" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
        >
          JSON → CSV
        </button>
      </div>

      <Label htmlFor="csv-json-input">{mode === "csv-to-json" ? "CSV de entrada" : "JSON de entrada (array de objetos)"}</Label>
      <textarea
        id="csv-json-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === "csv-to-json" ? "nombre,edad\nAna,30\nBeto,25" : '[{"nombre":"Ana","edad":30}]'}
        rows={8}
        spellCheck={false}
        className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={run} disabled={!input.trim()}>
          Convertir
        </Button>
        <Button type="button" variant="outline" onClick={handleSwap} disabled={!output}>
          <ArrowLeftRight className="h-4 w-4" /> Usar resultado como entrada
        </Button>
        <Button type="button" variant="outline" onClick={handleCopy} disabled={!output}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado" : "Copiar resultado"}
        </Button>
        <Button type="button" variant="ghost" onClick={handleClear} disabled={!input}>
          <Trash2 className="h-4 w-4" /> Limpiar
        </Button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {output && !error && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Resultado</p>
          <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-xl border border-emerald-200 bg-emerald-50 p-4 font-mono text-sm text-slate-800">{output}</pre>
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">
        La primera fila del CSV se usa como encabezado. Soporta campos entre comillas con comas o
        saltos de línea. Todo se procesa en tu navegador.
      </p>
    </Card>
  );
}
