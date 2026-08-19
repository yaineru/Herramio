"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { testRegex } from "@/lib/dev/regex-tester";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "dev-regex-tester";
const FLAG_OPTIONS = [
  { flag: "g", label: "g — global" },
  { flag: "i", label: "i — sin distinguir mayúsculas" },
  { flag: "m", label: "m — multilínea" },
  { flag: "s", label: "s — el punto incluye saltos de línea" },
];

export function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState<Record<string, boolean>>({ g: true, i: false, m: false, s: false });
  const [text, setText] = useState("");

  const activeFlags = Object.entries(flags).filter(([, on]) => on).map(([f]) => f).join("");
  const result = useMemo(() => {
    if (!pattern || !text) return null;
    return testRegex(pattern, activeFlags, text);
  }, [pattern, activeFlags, text]);

  useEffect(() => {
    if (!result) return;
    if (result.ok && result.matches.length > 0) AnalyticsEvents.toolUsed(TOOL_ID);
    if (!result.ok) AnalyticsEvents.toolError(TOOL_ID, result.error);
  }, [result]);

  function toggleFlag(flag: string) {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  }

  function renderHighlighted() {
    if (!result || !result.ok || result.matches.length === 0) return text;
    const parts: ReactNode[] = [];
    let last = 0;
    result.matches.forEach((m, i) => {
      if (m.index > last) parts.push(text.slice(last, m.index));
      parts.push(
        <mark key={i} className="rounded bg-amber-200 px-0.5">
          {m.match || " "}
        </mark>,
      );
      last = m.index + Math.max(m.match.length, 1);
    });
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  }

  return (
    <Card className="p-6">
      <Label htmlFor="regex-pattern">Expresión regular</Label>
      <div className="flex items-center gap-2">
        <span className="font-mono text-lg text-slate-400">/</span>
        <Input
          id="regex-pattern"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="[a-z]+@[a-z]+\.com"
          className="font-mono"
          spellCheck={false}
        />
        <span className="font-mono text-lg text-slate-400">/{activeFlags}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        {FLAG_OPTIONS.map(({ flag, label }) => (
          <label key={flag} className="flex items-center gap-1.5 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={flags[flag]}
              onChange={() => toggleFlag(flag)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            {label}
          </label>
        ))}
      </div>

      <div className="mt-4">
        <Label htmlFor="regex-text">Texto de prueba</Label>
        <textarea
          id="regex-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Pega aquí el texto donde buscar coincidencias..."
          rows={8}
          spellCheck={false}
          className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {result && !result.ok && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {result.error}
        </p>
      )}

      {result && result.ok && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            {result.matches.length} coincidencia{result.matches.length === 1 ? "" : "s"}
            {result.truncated && " (mostrando las primeras 500)"}
          </p>
          <div className="whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800">
            {renderHighlighted()}
          </div>
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">
        Para evitar que un patrón mal escrito bloquee tu navegador, el texto se limita a 20.000
        caracteres y se muestran como máximo 500 coincidencias.
      </p>
    </Card>
  );
}
