"use client";

import { useState } from "react";
import { Check, Copy, Link2Off } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { parseUrlParts } from "@/lib/dev/url-parts";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "dev-url-parser";

function Row({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="truncate font-mono text-sm text-slate-900">{value}</p>
      </div>
      <button type="button" onClick={handleCopy} className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label={`Copiar ${label}`}>
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function UrlPartsParser() {
  const [input, setInput] = useState("https://www.herramio.com/pdf-a-jpg?ref=blog&utm_source=x#section");

  function handleChange(value: string) {
    setInput(value);
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const parts = input.trim() !== "" ? parseUrlParts(input.trim()) : null;
  const showError = input.trim() !== "" && parts === null;

  return (
    <Card className="p-6">
      <Label htmlFor="url-parser-input">URL a analizar</Label>
      <Input
        id="url-parser-input"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="https://ejemplo.com/ruta?clave=valor"
      />

      {showError && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          <Link2Off className="h-4 w-4 shrink-0" /> Esa URL no es válida. Asegúrate de incluir el protocolo (https://).
        </p>
      )}

      {parts && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Row label="Protocolo" value={parts.protocol} />
          <Row label="Host" value={parts.host} />
          <Row label="Puerto" value={parts.port || "(por defecto)"} />
          <Row label="Ruta (pathname)" value={parts.pathname} />
          <Row label="Fragmento (hash)" value={parts.hash} />
        </div>
      )}

      {parts && parts.queryParams.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Parámetros de consulta</p>
          <div className="grid gap-2">
            {parts.queryParams.map((param, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm">
                <span className="font-mono font-medium text-slate-700">{param.key}</span>
                <span className="font-mono text-slate-500">{param.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">Calculado en tu navegador.</p>
    </Card>
  );
}
