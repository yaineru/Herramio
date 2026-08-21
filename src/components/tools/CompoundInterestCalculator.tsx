"use client";

import { useId, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { calculateCompoundInterest } from "@/lib/finanzas/compound-interest";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "finanzas-interes-compuesto";

function fmt(n: number): string {
  return new Intl.NumberFormat("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

const COMPOUND_OPTIONS = [
  { value: 1, label: "Anual" },
  { value: 4, label: "Trimestral" },
  { value: 12, label: "Mensual" },
  { value: 365, label: "Diaria" },
];

export function CompoundInterestCalculator() {
  const id = useId();
  const [principal, setPrincipal] = useState("1000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("10");
  const [monthlyContribution, setMonthlyContribution] = useState("0");
  const [compoundsPerYear, setCompoundsPerYear] = useState("12");

  function track() {
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const hasInput = [principal, rate, years, monthlyContribution, compoundsPerYear].every((v) => v.trim() !== "");
  const result = hasInput
    ? calculateCompoundInterest(Number(principal), Number(rate), Number(years), Number(monthlyContribution), Number(compoundsPerYear))
    : null;
  const isInvalid = hasInput && result === null;

  return (
    <Card className="p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${id}-principal`}>Capital inicial</Label>
          <Input id={`${id}-principal`} type="number" inputMode="decimal" min={0} value={principal} onChange={(e) => { setPrincipal(e.target.value); track(); }} />
        </div>
        <div>
          <Label htmlFor={`${id}-contribution`}>Aporte mensual</Label>
          <Input id={`${id}-contribution`} type="number" inputMode="decimal" min={0} value={monthlyContribution} onChange={(e) => { setMonthlyContribution(e.target.value); track(); }} />
        </div>
        <div>
          <Label htmlFor={`${id}-rate`}>Tasa de interés anual (%)</Label>
          <Input id={`${id}-rate`} type="number" inputMode="decimal" min={0} value={rate} onChange={(e) => { setRate(e.target.value); track(); }} />
        </div>
        <div>
          <Label htmlFor={`${id}-years`}>Años</Label>
          <Input id={`${id}-years`} type="number" inputMode="numeric" min={1} step={1} value={years} onChange={(e) => { setYears(e.target.value); track(); }} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`${id}-compounds`}>Frecuencia de capitalización</Label>
          <Select id={`${id}-compounds`} value={compoundsPerYear} onChange={(e) => { setCompoundsPerYear(e.target.value); track(); }}>
            {COMPOUND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6">
        {isInvalid && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Ingresa valores válidos: capital, tasa y aporte no negativos, y años como número entero mayor a 0.
          </p>
        )}
        {result && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-emerald-50 px-5 py-5 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Saldo final</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{fmt(result.finalBalance)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 px-5 py-5 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total aportado</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{fmt(result.totalContributed)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 px-5 py-5 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Interés generado</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{fmt(result.totalInterest)}</p>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-2 text-left">Año</th>
                    <th className="px-4 py-2 text-right">Aportado</th>
                    <th className="px-4 py-2 text-right">Interés</th>
                    <th className="px-4 py-2 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.yearly.map((row) => (
                    <tr key={row.year}>
                      <td className="px-4 py-2 text-slate-600">{row.year}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{fmt(row.contributed)}</td>
                      <td className="px-4 py-2 text-right text-emerald-600">{fmt(row.interest)}</td>
                      <td className="px-4 py-2 text-right font-medium text-slate-900">{fmt(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <p className="mt-5 text-xs text-slate-400">
        Estimación matemática, no un consejo financiero. Calculado en tu navegador.
      </p>
    </Card>
  );
}
