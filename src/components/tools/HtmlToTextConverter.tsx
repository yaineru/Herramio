"use client";

import { useState } from "react";
import { Check, Copy, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { htmlToText } from "@/lib/text/html-to-text";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "conv-html-a-texto";

export function HtmlToTextConverter() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  function handleChange(value: string) {
    setInput(value);
    if (value.trim() !== "") AnalyticsEvents.toolUsed(TOOL_ID);
  }

  function handleClear() {
    setInput("");
  }

  const output = input.trim() !== "" ? htmlToText(input) : "";

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
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="html-to-text-input">HTML</Label>
          <Textarea
            id="html-to-text-input"
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="<p>Pega aquí tu HTML...</p>"
            className="min-h-60 font-mono"
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="html-to-text-output">Texto sin etiquetas</Label>
            {output && (
              <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copiado" : "Copiar"}
              </Button>
            )}
          </div>
          <div
            id="html-to-text-output"
            className="min-h-60 whitespace-pre-wrap rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-800"
          >
            {output || <span className="text-slate-400">El texto extraído aparecerá aquí.</span>}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Button type="button" variant="ghost" onClick={handleClear} disabled={!input}>
          <Trash2 className="h-4 w-4" /> Limpiar
        </Button>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        El HTML se procesa con el analizador nativo del navegador (nunca se ejecutan scripts ni se cargan recursos
        externos) directamente en tu dispositivo: nunca se envía a ningún servidor.
      </p>
    </Card>
  );
}
