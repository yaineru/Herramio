"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { slugify } from "@/lib/text/slugify";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "texto-slug";

export function SlugGenerator() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const slug = input.trim() ? slugify(input) : "";

  function handleChange(value: string) {
    setInput(value);
    setCopied(false);
    if (value.trim()) AnalyticsEvents.toolUsed(TOOL_ID);
  }

  async function handleCopy() {
    if (!slug) return;
    try {
      await navigator.clipboard.writeText(slug);
      setCopied(true);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <Card className="p-6">
      <Label htmlFor="slug-input">Texto a convertir</Label>
      <Input
        id="slug-input"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Cómo Crear un Código QR Gratis"
      />

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Slug</p>
        {slug ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <code className="min-w-0 flex-1 truncate font-mono text-sm text-slate-800">{slug}</code>
            <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Escribe un texto para ver su slug.
          </p>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Todo ocurre en tu navegador; el texto que escribes nunca se envía a ningún servidor.
      </p>
    </Card>
  );
}
