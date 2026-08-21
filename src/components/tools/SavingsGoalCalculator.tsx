"use client";

import { useId, useState } from "react";
import { PiggyBank } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { calculateSavingsGoal } from "@/lib/finanzas/savings-goal";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "finanzas-ahorro-objetivo";

function fmt(n: number): string {
  return new Intl.NumberFormat("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function SavingsGoalCalculator() {
  const id = useId();
  const [target, setTarget] = useState("10000");
  const [current, setCurrent] = useState("0");
  const [months, setMonths] = useState("12");
  const [rate, setRate] = useState("0");

  function track() {
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const hasInput = [target, current, months, rate].every((v) => v.trim() !== "");
  const result = hasInput ? calculateSavingsGoal(Number(target), Number(current), Number(months), Number(rate)) : null;
  const isInvalid = hasInput && result === null;

  return (
    <Card className="p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${id}-target`}>Monto objetivo</Label>
          <Input id={`${id}-target`} type="number" inputMode="decimal" min={0} value={target} onChange={(e) => { setTarget(e.target.value); track(); }} />
        </div>
        <div>
          <Label htmlFor={`${id}-current`}>Ahorro actual</Label>
          <Input id={`${id}-current`} type="number" inputMode="decimal" min={0} value={current} onChange={(e) => { setCurrent(e.target.value); track(); }} />
        </div>
        <div>
          <Label htmlFor={`${id}-months`}>Plazo (meses)</Label>
          <Input id={`${id}-months`} type="number" inputMode="numeric" min={1} step={1} value={months} onChange={(e) => { setMonths(e.target.value); track(); }} />
        </div>
        <div>
          <Label htmlFor={`${id}-rate`}>Rendimiento anual (%, opcional)</Label>
          <Input id={`${id}-rate`} type="number" inputMode="decimal" min={0} value={rate} onChange={(e) => { setRate(e.target.value); track(); }} />
        </div>
      </div>

      <div className="mt-6">
        {isInvalid && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Ingresa un monto objetivo positivo, un plazo en meses (entero mayor a 0) y valores no negativos.
          </p>
        )}
        {result?.alreadyReached && (
          <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
            <PiggyBank className="h-4 w-4 shrink-0" /> Tu ahorro actual ya alcanza tu objetivo en ese plazo. ¡No
            necesitas aportar más!
          </p>
        )}
        {result && !result.alreadyReached && (
          <div className="rounded-2xl bg-emerald-50 px-5 py-6 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Aporte mensual necesario</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{fmt(result.monthlyContribution)}</p>
          </div>
        )}
      </div>

      <p className="mt-5 text-xs text-slate-400">Estimación matemática, no un consejo financiero. Calculado en tu navegador.</p>
    </Card>
  );
}
