"use client";

import { useState } from "react";
import { Check, Copy, Hash } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { extractHashtags } from "@/lib/text/extract-hashtags";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "texto-extraer-hashtags";

export function HashtagExtractor() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  function handleChange(value: string) {
    setInput(value);
    if (extractHashtags(value).length > 0) AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const hashtags = extractHashtags(input);

  async function handleCopy() {
    if (hashtags.length === 0) return;
    try {
      await navigator.clipboard.writeText(hashtags.join(" "));
      setCopied(true);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <Card className="p-6">
      <Label htmlFor="hashtag-extractor-input">Texto o publicación</Label>
      <Textarea
        id="hashtag-extractor-input"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Pega aquí una publicación, un tuit o cualquier texto con #hashtags..."
        className="min-h-40"
      />

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {hashtags.length > 0
              ? `${hashtags.length} hashtag${hashtags.length !== 1 ? "s" : ""} encontrado${hashtags.length !== 1 ? "s" : ""}`
              : "Hashtags encontrados"}
          </p>
          {hashtags.length > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado" : "Copiar todos"}
            </Button>
          )}
        </div>

        {hashtags.length > 0 ? (
          <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {hashtags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-emerald-700 shadow-sm">
                <Hash className="h-3.5 w-3.5 shrink-0" />
                {tag.slice(1)}
              </span>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Pega un texto para extraer los hashtags que contiene.
          </p>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Todo ocurre en tu navegador; el texto que pegas nunca se envía a ningún servidor.
      </p>
    </Card>
  );
}
