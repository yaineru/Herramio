"use client";

import { useId, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { convertDataSize, DATA_UNITS, type DataUnit, type DataSizeResult } from "@/lib/converters/data-size";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "conv-datos";

const UNIT_LABELS: Record<DataUnit, string> = {
  b: "Bytes (B)",
  kb: "Kilobytes (KB)",
  mb: "Megabytes (MB)",
  gb: "Gigabytes (GB)",
  tb: "Terabytes (TB)",
};

function formatNumber(n: number): string {
  if (n === 0) return "0";
  if (n >= 1000) return n.toLocaleString("es", { maximumFractionDigits: 2 });
  return n.toLocaleString("es", { maximumFractionDigits: 6, maximumSignificantDigits: 6 });
}

function ResultRow({ unit, value }: { unit: DataUnit; value: number }) {
  const [copied, setCopied] = useState(false);
  const text = formatNumber(value);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
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
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{UNIT_LABELS[unit]}</p>
        <p className="truncate font-mono text-lg text-slate-900">{text}</p>
      </div>
      <button type="button" onClick={handleCopy} className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label={`Copiar ${UNIT_LABELS[unit]}`}>
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function DataSizeConverter() {
  const id = useId();
  const [value, setValue] = useState("1");
  const [fromUnit, setFromUnit] = useState<DataUnit>("gb");
  const [base, setBase] = useState<1024 | 1000>(1024);

  const numericValue = Number(value);
  const result: DataSizeResult | null =
    value.trim() !== "" && Number.isFinite(numericValue) ? convertDataSize(numericValue, fromUnit, base) : null;
  const showError = value.trim() !== "" && result === null;

  function track() {
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  return (
    <Card className="p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${id}-value`}>Cantidad</Label>
          <Input
            id={`${id}-value`}
            type="number"
            value={value}
            onChange={(e) => { setValue(e.target.value); track(); }}
            placeholder="1"
          />
        </div>
        <div>
          <Label htmlFor={`${id}-unit`}>Unidad de origen</Label>
          <Select
            id={`${id}-unit`}
            value={fromUnit}
            onChange={(e) => { setFromUnit(e.target.value as DataUnit); track(); }}
          >
            {DATA_UNITS.map((u) => (
              <option key={u} value={u}>{UNIT_LABELS[u]}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-4 flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        {(
          [
            { value: 1024 as const, label: "Binario (1 KB = 1024 B)" },
            { value: 1000 as const, label: "Decimal (1 KB = 1000 B)" },
          ]
        ).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => { setBase(opt.value); track(); }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${base === opt.value ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {showError && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          Escribe un número válido y no negativo.
        </p>
      )}

      {result && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {DATA_UNITS.map((u) => (
            <ResultRow key={u} unit={u} value={result[u]} />
          ))}
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">
        La base binaria (1024) es la que usan los sistemas operativos; la decimal (1000) es la que suelen usar los
        fabricantes de almacenamiento. Calculado en tu navegador.
      </p>
    </Card>
  );
}
