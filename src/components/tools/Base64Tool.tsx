"use client";

import { useState } from "react";
import { ArrowLeftRight, Check, Copy, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { encodeBase64, decodeBase64 } from "@/lib/dev/base64";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "dev-base64";

type Mode = "encode" | "decode";

export function Base64Tool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function run(nextMode: Mode = mode) {
    if (!input) {
      setOutput("");
      setError(null);
      return;
    }
    if (nextMode === "encode") {
      setOutput(encodeBase64(input));
      setError(null);
      AnalyticsEvents.toolUsed(TOOL_ID);
    } else {
      const result = decodeBase64(input);
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
  }

  function handleSwap() {
    const nextMode: Mode = mode === "encode" ? "decode" : "encode";
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
          onClick={() => setMode("encode")}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${mode === "encode" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
        >
          Codificar
        </button>
        <button
          type="button"
          onClick={() => setMode("decode")}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${mode === "decode" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
        >
          Decodificar
        </button>
      </div>

      <Label htmlFor="base64-input">{mode === "encode" ? "Texto a codificar" : "Base64 a decodificar"}</Label>
      <textarea
        id="base64-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === "encode" ? "Escribe o pega el texto..." : "Pega el texto en Base64..."}
        rows={6}
        spellCheck={false}
        className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={() => run()} disabled={!input}>
          {mode === "encode" ? "Codificar" : "Decodificar"}
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
    </Card>
  );
}
