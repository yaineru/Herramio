"use client";

import { useState } from "react";
import { ArrowLeftRight, Check, Copy, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { escapeHtml, unescapeHtml } from "@/lib/dev/html-escape";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "dev-html-escape";

type Mode = "escape" | "unescape";

export function HtmlEscapeTool() {
  const [mode, setMode] = useState<Mode>("escape");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  function run(nextMode: Mode = mode) {
    if (!input) {
      setOutput("");
      return;
    }
    setOutput(nextMode === "escape" ? escapeHtml(input) : unescapeHtml(input));
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  function handleSwap() {
    const nextMode: Mode = mode === "escape" ? "unescape" : "escape";
    setMode(nextMode);
    setInput(output);
    setOutput("");
  }

  function handleClear() {
    setInput("");
    setOutput("");
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
          onClick={() => setMode("escape")}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${mode === "escape" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
        >
          Escapar
        </button>
        <button
          type="button"
          onClick={() => setMode("unescape")}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${mode === "unescape" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
        >
          Desescapar
        </button>
      </div>

      <Label htmlFor="html-escape-input">{mode === "escape" ? "HTML a escapar" : "Entidades HTML a convertir"}</Label>
      <textarea
        id="html-escape-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === "escape" ? '<div class="ejemplo">Hola & bienvenido</div>' : "&lt;div&gt;Hola &amp; bienvenido&lt;/div&gt;"}
        rows={6}
        spellCheck={false}
        className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={() => run()} disabled={!input}>
          {mode === "escape" ? "Escapar" : "Desescapar"}
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

      {output && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Resultado</p>
          <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-xl border border-emerald-200 bg-emerald-50 p-4 font-mono text-sm text-slate-800">{output}</pre>
        </div>
      )}
    </Card>
  );
}
