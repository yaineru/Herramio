"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { explainRegex } from "@/lib/dev/regex-explainer";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "dev-regex-explicador";

const EXAMPLES = ["^\\d{4}-\\d{2}-\\d{2}$", "[\\w.-]+@[\\w.-]+\\.\\w+", "(?<year>\\d{4})", "https?://\\S+"];

export function RegexExplainer() {
  const [pattern, setPattern] = useState(EXAMPLES[0]);

  function handleChange(value: string) {
    setPattern(value);
    if (value.trim() !== "") AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const { tokens, error } = useMemo(() => {
    if (pattern.trim() === "") return { tokens: [] as ReturnType<typeof explainRegex>, error: null as string | null };
    try {
      new RegExp(pattern);
      return { tokens: explainRegex(pattern), error: null };
    } catch (err) {
      const message = err instanceof Error ? `Expresión regular inválida: ${err.message}` : "Expresión regular inválida.";
      return { tokens: [] as ReturnType<typeof explainRegex>, error: message };
    }
  }, [pattern]);

  return (
    <Card className="p-6">
      <Label htmlFor="regex-input">Expresión regular</Label>
      <Input
        id="regex-input"
        value={pattern}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="\\d{4}-\\d{2}-\\d{2}"
        className="font-mono"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => handleChange(example)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          >
            {example}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {tokens.length > 0 && !error && (
        <div className="mt-5">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
            <Search className="h-3.5 w-3.5" /> Explicación parte por parte
          </p>
          <div className="grid gap-2">
            {tokens.map((token, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                <code className="shrink-0 rounded bg-slate-900 px-2 py-1 font-mono text-xs text-white">{token.raw}</code>
                <span className="text-sm text-slate-600">{token.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">
        Explica la sintaxis estándar de la expresión (literales, clases de caracteres, cuantificadores, grupos), no
        la intención de quien la escribió. Con patrones muy inusuales, la explicación puede quedar incompleta.
      </p>
    </Card>
  );
}
