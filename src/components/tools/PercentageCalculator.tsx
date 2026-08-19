"use client";

import { useId, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { calculatePercentage, type PercentageMode } from "@/lib/calculators/percentage";
import { AnalyticsEvents } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const MODES: {
  id: PercentageMode;
  label: string;
  aLabel: string;
  bLabel: string;
  resultSuffix: string;
}[] = [
  { id: "of", label: "X% de Y", aLabel: "Porcentaje (%)", bLabel: "Cantidad", resultSuffix: "" },
  { id: "isWhatPercent", label: "X es qué % de Y", aLabel: "Cantidad", bLabel: "Total", resultSuffix: "%" },
  { id: "increase", label: "Aumentar en X%", aLabel: "Cantidad", bLabel: "Porcentaje (%)", resultSuffix: "" },
  { id: "decrease", label: "Disminuir en X%", aLabel: "Cantidad", bLabel: "Porcentaje (%)", resultSuffix: "" },
];

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es", { maximumFractionDigits: 4 }).format(value);
}

export function PercentageCalculator() {
  const id = useId();
  const [mode, setMode] = useState<PercentageMode>("of");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [copied, setCopied] = useState(false);

  const activeMode = MODES.find((m) => m.id === mode)!;
  const aNum = Number(a);
  const bNum = Number(b);
  const hasInput = a.trim() !== "" && b.trim() !== "";
  const isInvalidNumber = hasInput && (!Number.isFinite(aNum) || !Number.isFinite(bNum));
  const result = hasInput && !isInvalidNumber ? calculatePercentage(mode, aNum, bNum) : null;
  const isDivisionError = hasInput && !isInvalidNumber && mode === "isWhatPercent" && bNum === 0;

  function handleModeChange(next: PercentageMode) {
    setMode(next);
    setCopied(false);
  }

  function handleClear() {
    setA("");
    setB("");
    setCopied(false);
  }

  async function handleCopy() {
    if (result === null) return;
    try {
      await navigator.clipboard.writeText(formatNumber(result.value) + activeMode.resultSuffix);
      setCopied(true);
      AnalyticsEvents.copyLink("calc-porcentaje");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op, the result is already visible on screen
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => handleModeChange(m.id)}
            className={cn(
              "rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
              m.id === mode
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500 hover:bg-white/60 hover:text-slate-700",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${id}-a`}>{activeMode.aLabel}</Label>
          <Input
            id={`${id}-a`}
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={a}
            onChange={(e) => setA(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${id}-b`}>{activeMode.bLabel}</Label>
          <Input
            id={`${id}-b`}
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={b}
            onChange={(e) => setB(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6">
        {!hasInput && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Completa ambos campos para ver el resultado.
          </p>
        )}

        {isInvalidNumber && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Ingresa solo números válidos.
          </p>
        )}

        {isDivisionError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            No se puede calcular un porcentaje sobre un total de 0.
          </p>
        )}

        {result !== null && (
          <div className="rounded-2xl bg-emerald-50 px-5 py-6 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
              Resultado
            </p>
            <p className="mt-1 text-4xl font-bold text-slate-900">
              {formatNumber(result.value)}
              {activeMode.resultSuffix}
            </p>
            <p className="mt-1.5 text-sm text-slate-500">{result.formula}</p>
          </div>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={result === null}
          onClick={handleCopy}
          className="flex-1"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado" : "Copiar resultado"}
        </Button>
        <Button type="button" variant="ghost" onClick={handleClear}>
          <RotateCcw className="h-4 w-4" /> Limpiar
        </Button>
      </div>
    </Card>
  );
}
