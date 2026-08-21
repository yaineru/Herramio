"use client";

import { useId, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { convertNumberBase, type NumberBase, type NumberBaseResult } from "@/lib/converters/number-base";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "conv-base-numerica";

const BASE_LABELS: Record<NumberBase, string> = {
  2: "Binario (base 2)",
  8: "Octal (base 8)",
  10: "Decimal (base 10)",
  16: "Hexadecimal (base 16)",
};

const BASES: NumberBase[] = [2, 8, 10, 16];

function ResultRow({ base, value }: { base: NumberBase; value: string }) {
  const [copied, setCopied] = useState(false);

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
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{BASE_LABELS[base]}</p>
        <p className="truncate font-mono text-lg text-slate-900">{value}</p>
      </div>
      <button type="button" onClick={handleCopy} className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label={`Copiar ${BASE_LABELS[base]}`}>
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function NumberBaseConverter() {
  const id = useId();
  const [value, setValue] = useState("255");
  const [fromBase, setFromBase] = useState<NumberBase>(10);

  const result: NumberBaseResult | null = convertNumberBase(value, fromBase);
  const showError = value.trim() !== "" && result === null;

  function handleChange(next: string) {
    setValue(next);
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  return (
    <Card className="p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${id}-value`}>Número</Label>
          <Input id={`${id}-value`} value={value} onChange={(e) => handleChange(e.target.value)} placeholder="255" />
        </div>
        <div>
          <Label htmlFor={`${id}-base`}>Base de origen</Label>
          <Select
            id={`${id}-base`}
            value={fromBase}
            onChange={(e) => {
              setFromBase(Number(e.target.value) as NumberBase);
              AnalyticsEvents.toolUsed(TOOL_ID);
            }}
          >
            {BASES.map((b) => (
              <option key={b} value={b}>{BASE_LABELS[b]}</option>
            ))}
          </Select>
        </div>
      </div>

      {showError && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          &quot;{value}&quot; no es un número válido en {BASE_LABELS[fromBase].toLowerCase()}.
        </p>
      )}

      {result && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {BASES.map((b) => (
            <ResultRow key={b} base={b} value={result[b]} />
          ))}
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">Calculado en tu navegador.</p>
    </Card>
  );
}
