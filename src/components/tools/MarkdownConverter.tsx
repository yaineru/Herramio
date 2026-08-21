"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { markdownToHtml } from "@/lib/text/markdown";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "conv-markdown-html";

const PLACEHOLDER = `# Título

Este es un párrafo con **negrita** y *cursiva*.

- Un punto
- Otro punto

[Herramio](https://herramio.com)`;

export function MarkdownConverter() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  function handleChange(value: string) {
    setInput(value);
    if (value.trim()) AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const html = input.trim() ? markdownToHtml(input) : "";

  async function handleCopy() {
    if (!html) return;
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <Card className="p-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="markdown-input">Markdown</Label>
          <textarea
            id="markdown-input"
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={12}
            spellCheck={false}
            className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="markdown-preview-label">Vista previa</Label>
            {html && (
              <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copiado" : "Copiar HTML"}
              </Button>
            )}
          </div>
          <div
            id="markdown-preview-label"
            className="prose prose-sm min-h-[18rem] max-w-none overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 [&_a]:text-emerald-700 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-500 [&_code]:rounded [&_code]:bg-slate-200 [&_code]:px-1 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:my-4 [&_hr]:border-slate-300 [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-2 [&_ul]:list-disc"
            dangerouslySetInnerHTML={{ __html: html || '<p class="text-slate-400">La vista previa aparece aquí…</p>' }}
          />
        </div>
      </div>

      <p className="mt-5 text-xs text-slate-400">
        Cubre encabezados, negrita, cursiva, código en línea, enlaces, listas, citas y líneas horizontales. Todo
        ocurre en tu navegador; el texto que escribes nunca se envía a ningún servidor.
      </p>
    </Card>
  );
}
