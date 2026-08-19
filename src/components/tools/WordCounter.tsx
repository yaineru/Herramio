"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getTextStats } from "@/lib/text/word-stats";
import { AnalyticsEvents } from "@/lib/analytics";

const STAT_LABELS: { key: keyof ReturnType<typeof getTextStats>; label: string }[] = [
  { key: "words", label: "Palabras" },
  { key: "characters", label: "Caracteres" },
  { key: "charactersNoSpaces", label: "Sin espacios" },
  { key: "lines", label: "Líneas" },
  { key: "paragraphs", label: "Párrafos" },
  { key: "readingTimeMinutes", label: "Min. de lectura" },
];

export function WordCounter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const stats = useMemo(() => getTextStats(text), [text]);

  async function handleCopy() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      AnalyticsEvents.copyLink("texto-contador-palabras");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  async function handlePaste() {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText((prev) => prev + clipboardText);
    } catch {
      // clipboard read denied or unsupported — user can paste manually with Ctrl/Cmd+V
    }
  }

  function handleClear() {
    setText("");
    setCopied(false);
  }

  return (
    <Card className="p-6">
      <label htmlFor="word-counter-input" className="sr-only">
        Texto a analizar
      </label>
      <textarea
        id="word-counter-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe o pega tu texto aquí..."
        rows={12}
        className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={handlePaste}>
          Pegar
        </Button>
        <Button type="button" variant="outline" onClick={handleCopy} disabled={!text}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
        <Button type="button" variant="ghost" onClick={handleClear} disabled={!text}>
          <Trash2 className="h-4 w-4" /> Limpiar
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STAT_LABELS.map((stat) => (
          <div
            key={stat.key}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-center"
          >
            <p className="text-2xl font-bold text-slate-900">{stats[stat.key]}</p>
            <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
