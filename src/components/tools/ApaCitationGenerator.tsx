"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { buildApaCitation, type ApaSourceType } from "@/lib/text/apa-citation";
import { cn } from "@/lib/utils";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "texto-citas-apa";

const TYPE_LABELS: Record<ApaSourceType, string> = {
  book: "Libro",
  website: "Sitio web",
  journal: "Artículo de revista",
};

export function ApaCitationGenerator() {
  const [type, setType] = useState<ApaSourceType>("book");
  const [authors, setAuthors] = useState("");
  const [year, setYear] = useState("");
  const [title, setTitle] = useState("");
  const [publisher, setPublisher] = useState("");
  const [siteName, setSiteName] = useState("");
  const [url, setUrl] = useState("");
  const [journalName, setJournalName] = useState("");
  const [volume, setVolume] = useState("");
  const [issue, setIssue] = useState("");
  const [pages, setPages] = useState("");
  const [copied, setCopied] = useState(false);

  const hasBase = authors.trim() !== "" && year.trim() !== "" && title.trim() !== "";
  const result = hasBase
    ? buildApaCitation({ type, authors, year, title, publisher, siteName, url, journalName, volume, issue, pages })
    : null;

  function handleChange() {
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  async function handleCopy() {
    if (!result?.ok) return;
    try {
      await navigator.clipboard.writeText(result.value);
      setCopied(true);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
        {(Object.keys(TYPE_LABELS) as ApaSourceType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setType(t);
              handleChange();
            }}
            className={cn(
              "rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
              t === type ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:bg-white/60 hover:text-slate-700",
            )}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="apa-authors">Autor(es)</Label>
          <Input id="apa-authors" placeholder="García, M." value={authors} onChange={(e) => { setAuthors(e.target.value); handleChange(); }} />
        </div>
        <div>
          <Label htmlFor="apa-year">Año</Label>
          <Input id="apa-year" placeholder="2024" value={year} onChange={(e) => { setYear(e.target.value); handleChange(); }} />
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor="apa-title">Título</Label>
        <Input id="apa-title" placeholder="Título de la obra" value={title} onChange={(e) => { setTitle(e.target.value); handleChange(); }} />
      </div>

      {type === "book" && (
        <div className="mt-4">
          <Label htmlFor="apa-publisher">Editorial</Label>
          <Input id="apa-publisher" placeholder="Editorial Norte" value={publisher} onChange={(e) => { setPublisher(e.target.value); handleChange(); }} />
        </div>
      )}

      {type === "website" && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="apa-sitename">Nombre del sitio (opcional)</Label>
            <Input id="apa-sitename" placeholder="Blog Ejemplo" value={siteName} onChange={(e) => { setSiteName(e.target.value); handleChange(); }} />
          </div>
          <div>
            <Label htmlFor="apa-url">URL</Label>
            <Input id="apa-url" placeholder="https://ejemplo.com/articulo" value={url} onChange={(e) => { setUrl(e.target.value); handleChange(); }} />
          </div>
        </div>
      )}

      {type === "journal" && (
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <Label htmlFor="apa-journal">Revista</Label>
            <Input id="apa-journal" placeholder="Revista de Psicología" value={journalName} onChange={(e) => { setJournalName(e.target.value); handleChange(); }} />
          </div>
          <div>
            <Label htmlFor="apa-volume">Volumen</Label>
            <Input id="apa-volume" placeholder="12" value={volume} onChange={(e) => { setVolume(e.target.value); handleChange(); }} />
          </div>
          <div>
            <Label htmlFor="apa-issue">Número</Label>
            <Input id="apa-issue" placeholder="3" value={issue} onChange={(e) => { setIssue(e.target.value); handleChange(); }} />
          </div>
          <div className="sm:col-span-4">
            <Label htmlFor="apa-pages">Páginas (opcional)</Label>
            <Input id="apa-pages" placeholder="45-60" value={pages} onChange={(e) => { setPages(e.target.value); handleChange(); }} />
          </div>
        </div>
      )}

      <div className="mt-6">
        {!hasBase && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Completa autor, año y título para generar la cita.
          </p>
        )}
        {result && !result.ok && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {result.error}
          </p>
        )}
        {result?.ok && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm text-slate-800">{result.value}</p>
            <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
        )}
      </div>

      <p className="mt-5 text-xs text-slate-400">
        Formato APA 7.ª edición. El título y el nombre de la revista deben ir en cursiva según la norma —
        aplícala después de pegar la cita en tu documento.
      </p>
    </Card>
  );
}
