"use client";

import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { extractUrls } from "@/lib/text/extract-urls";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "texto-extraer-urls";

export function UrlExtractor() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  function handleChange(value: string) {
    setInput(value);
    if (extractUrls(value).length > 0) AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const urls = extractUrls(input);

  async function handleCopy() {
    if (urls.length === 0) return;
    try {
      await navigator.clipboard.writeText(urls.join("\n"));
      setCopied(true);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <Card className="p-6">
      <Label htmlFor="url-extractor-input">Texto con enlaces mezclados</Label>
      <Textarea
        id="url-extractor-input"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Pega aquí un texto, artículo o correo con enlaces mezclados..."
        className="min-h-40"
      />

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {urls.length > 0 ? `${urls.length} enlace${urls.length !== 1 ? "s" : ""} encontrado${urls.length !== 1 ? "s" : ""}` : "Enlaces encontrados"}
          </p>
          {urls.length > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado" : "Copiar todos"}
            </Button>
          )}
        </div>

        {urls.length > 0 ? (
          <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {urls.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 truncate rounded-lg bg-white px-3 py-1.5 text-sm text-emerald-700 shadow-sm hover:underline"
              >
                <Link2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{url}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Pega un texto para extraer los enlaces que contiene.
          </p>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Todo ocurre en tu navegador; el texto que pegas nunca se envía a ningún servidor.
      </p>
    </Card>
  );
}
