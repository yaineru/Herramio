"use client";

import { useState } from "react";
import { Check, Copy, Trash2, AlignLeft, Minimize2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { formatJson, minifyJson } from "@/lib/dev/json-tool";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "dev-json-formatter";

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function run(fn: typeof formatJson | typeof minifyJson) {
    if (!input.trim()) return;
    const result = fn(input);
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
      <Label htmlFor="json-input">JSON de entrada</Label>
      <textarea
        id="json-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='{"ejemplo": [1, 2, 3]}'
        rows={10}
        spellCheck={false}
        className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={() => run(formatJson)} disabled={!input.trim()}>
          <AlignLeft className="h-4 w-4" /> Formatear
        </Button>
        <Button type="button" variant="outline" onClick={() => run(minifyJson)} disabled={!input.trim()}>
          <Minimize2 className="h-4 w-4" /> Minificar
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
          <pre className="overflow-x-auto rounded-xl border border-emerald-200 bg-emerald-50 p-4 font-mono text-sm text-slate-800">{output}</pre>
        </div>
      )}
    </Card>
  );
}
