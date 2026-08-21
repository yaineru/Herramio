"use client";

import { useId, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { calculateLoan } from "@/lib/finanzas/loan";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "finanzas-prestamo";

function fmt(n: number): string {
  return new Intl.NumberFormat("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function LoanCalculator() {
  const id = useId();
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("8");
  const [months, setMonths] = useState("24");

  function track() {
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const hasInput = [principal, rate, months].every((v) => v.trim() !== "");
  const result = hasInput ? calculateLoan(Number(principal), Number(rate), Number(months)) : null;
  const isInvalid = hasInput && result === null;

  return (
    <Card className="p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor={`${id}-principal`}>Monto del préstamo</Label>
          <Input id={`${id}-principal`} type="number" inputMode="decimal" min={0} value={principal} onChange={(e) => { setPrincipal(e.target.value); track(); }} />
        </div>
        <div>
          <Label htmlFor={`${id}-rate`}>Tasa de interés anual (%)</Label>
          <Input id={`${id}-rate`} type="number" inputMode="decimal" min={0} value={rate} onChange={(e) => { setRate(e.target.value); track(); }} />
        </div>
        <div>
          <Label htmlFor={`${id}-months`}>Plazo (meses)</Label>
          <Input id={`${id}-months`} type="number" inputMode="numeric" min={1} step={1} value={months} onChange={(e) => { setMonths(e.target.value); track(); }} />
        </div>
      </div>

      <div className="mt-6">
        {isInvalid && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Ingresa un monto positivo, una tasa no negativa y un plazo en meses (número entero mayor a 0).
          </p>
        )}
        {result && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-emerald-50 px-5 py-5 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Cuota mensual</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{fmt(result.monthlyPayment)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 px-5 py-5 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total a pagar</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{fmt(result.totalPaid)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 px-5 py-5 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Interés total</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{fmt(result.totalInterest)}</p>
              </div>
            </div>

            <div className="mt-5 max-h-80 overflow-y-auto overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-2 text-left">Mes</th>
                    <th className="px-4 py-2 text-right">Cuota</th>
                    <th className="px-4 py-2 text-right">Capital</th>
                    <th className="px-4 py-2 text-right">Interés</th>
                    <th className="px-4 py-2 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.schedule.map((row) => (
                    <tr key={row.month}>
                      <td className="px-4 py-2 text-slate-600">{row.month}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{fmt(row.payment)}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{fmt(row.principal)}</td>
                      <td className="px-4 py-2 text-right text-amber-600">{fmt(row.interest)}</td>
                      <td className="px-4 py-2 text-right font-medium text-slate-900">{fmt(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <p className="mt-5 text-xs text-slate-400">Estimación matemática, no un consejo financiero. Calculado en tu navegador.</p>
    </Card>
  );
}
