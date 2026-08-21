"use client";

import { useId, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { adjustForInflation } from "@/lib/finanzas/inflation";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "finanzas-inflacion";

function fmt(n: number): string {
  return new Intl.NumberFormat("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function InflationCalculator() {
  const id = useId();
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState("5");
  const [years, setYears] = useState("10");

  function track() {
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const hasInput = [amount, rate, years].every((v) => v.trim() !== "");
  const result = hasInput ? adjustForInflation(Number(amount), Number(rate), Number(years)) : null;
  const isInvalid = hasInput && result === null;

  return (
    <Card className="p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor={`${id}-amount`}>Monto actual</Label>
          <Input id={`${id}-amount`} type="number" inputMode="decimal" min={0} value={amount} onChange={(e) => { setAmount(e.target.value); track(); }} />
        </div>
        <div>
          <Label htmlFor={`${id}-rate`}>Inflación anual (%)</Label>
          <Input id={`${id}-rate`} type="number" inputMode="decimal" min={0} value={rate} onChange={(e) => { setRate(e.target.value); track(); }} />
        </div>
        <div>
          <Label htmlFor={`${id}-years`}>Años</Label>
          <Input id={`${id}-years`} type="number" inputMode="decimal" min={0} value={years} onChange={(e) => { setYears(e.target.value); track(); }} />
        </div>
      </div>

      <div className="mt-6">
        {isInvalid && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Ingresa valores no negativos para el monto, la tasa y los años.
          </p>
        )}
        {result && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50 px-5 py-5 text-center sm:col-span-1">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Equivalente futuro</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{fmt(result.adjustedAmount)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 px-5 py-5 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Aumento total</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{fmt(result.totalIncrease)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 px-5 py-5 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Aumento (%)</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{fmt(result.totalIncreasePercent)}%</p>
            </div>
          </div>
        )}
      </div>

      <p className="mt-5 text-xs text-slate-400">
        Necesitarías esa cantidad en el futuro para tener el mismo poder adquisitivo que hoy, asumiendo una
        inflación anual constante. Estimación matemática, no un consejo financiero.
      </p>
    </Card>
  );
}
