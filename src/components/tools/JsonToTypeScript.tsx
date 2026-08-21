"use client";

import { useState } from "react";
import { Check, Copy, Trash2, FileCode2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { jsonToTypeScript } from "@/lib/dev/json-to-typescript";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "dev-json-a-typescript";

export function JsonToTypeScript() {
  const [input, setInput] = useState("");
  const [rootName, setRootName] = useState("Root");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleGenerate() {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const result = jsonToTypeScript(parsed, rootName.trim() || "Root");
      setOutput(result);
      setError(null);
      AnalyticsEvents.toolUsed(TOOL_ID);
    } catch (err) {
      setOutput("");
      const message = err instanceof Error ? `JSON inválido: ${err.message}` : "JSON inválido.";
      setError(message);
      AnalyticsEvents.toolError(TOOL_ID, message);
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
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Label htmlFor="json-ts-input">JSON de entrada</Label>
          <textarea
            id="json-ts-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"id": 1, "name": "Ana", "tags": ["a", "b"]}'
            rows={10}
            spellCheck={false}
            className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="w-full sm:w-40">
          <Label htmlFor="root-name">Nombre raíz</Label>
          <Input id="root-name" value={rootName} onChange={(e) => setRootName(e.target.value)} placeholder="Root" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={handleGenerate} disabled={!input.trim()}>
          <FileCode2 className="h-4 w-4" /> Generar TypeScript
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

      <p className="mt-4 text-xs text-slate-400">
        Los tipos se infieren solo a partir de los valores presentes en tu JSON; un campo con valor <code>null</code>{" "}
        se tipa como <code>null</code>, no como el tipo real que podría tener en otros casos.
      </p>
    </Card>
  );
}
