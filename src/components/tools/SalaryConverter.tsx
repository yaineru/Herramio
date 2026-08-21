"use client";

import { useId, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { convertSalary, type SalaryPeriod } from "@/lib/finanzas/salary-converter";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "finanzas-salario";

const PERIOD_LABELS: Record<SalaryPeriod, string> = {
  hourly: "Por hora",
  daily: "Por día",
  monthly: "Mensual",
  annual: "Anual",
};

function fmt(n: number): string {
  return new Intl.NumberFormat("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function SalaryConverter() {
  const id = useId();
  const [amount, setAmount] = useState("20");
  const [period, setPeriod] = useState<SalaryPeriod>("hourly");
  const [hoursPerDay, setHoursPerDay] = useState("8");
  const [daysPerWeek, setDaysPerWeek] = useState("5");

  function track() {
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const hasInput = [amount, hoursPerDay, daysPerWeek].every((v) => v.trim() !== "");
  const result = hasInput ? convertSalary(Number(amount), period, Number(hoursPerDay), Number(daysPerWeek)) : null;
  const isInvalid = hasInput && result === null;

  return (
    <Card className="p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${id}-amount`}>Monto</Label>
          <Input id={`${id}-amount`} type="number" inputMode="decimal" min={0} value={amount} onChange={(e) => { setAmount(e.target.value); track(); }} />
        </div>
        <div>
          <Label htmlFor={`${id}-period`}>Periodo del monto</Label>
          <Select id={`${id}-period`} value={period} onChange={(e) => { setPeriod(e.target.value as SalaryPeriod); track(); }}>
            {(Object.keys(PERIOD_LABELS) as SalaryPeriod[]).map((p) => (
              <option key={p} value={p}>{PERIOD_LABELS[p]}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`${id}-hours`}>Horas por día</Label>
          <Input id={`${id}-hours`} type="number" inputMode="decimal" min={0} value={hoursPerDay} onChange={(e) => { setHoursPerDay(e.target.value); track(); }} />
        </div>
        <div>
          <Label htmlFor={`${id}-days`}>Días por semana</Label>
          <Input id={`${id}-days`} type="number" inputMode="decimal" min={0} value={daysPerWeek} onChange={(e) => { setDaysPerWeek(e.target.value); track(); }} />
        </div>
      </div>

      <div className="mt-6">
        {isInvalid && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Ingresa valores válidos: el monto no puede ser negativo y las horas/días deben ser mayores a 0.
          </p>
        )}
        {result && (
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(PERIOD_LABELS) as SalaryPeriod[]).map((p) => (
              <div
                key={p}
                className={`rounded-2xl px-5 py-4 text-center ${p === period ? "bg-emerald-50" : "border border-slate-200"}`}
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{PERIOD_LABELS[p]}</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{fmt(result[p])}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-5 text-xs text-slate-400">Basado en 52 semanas al año. Calculado en tu navegador.</p>
    </Card>
  );
}
