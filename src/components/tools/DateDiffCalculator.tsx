"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { calculateDateDiff } from "@/lib/calculators/date-diff";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "calc-fecha";

export function DateDiffCalculator() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const result =
    startDate && endDate ? calculateDateDiff(new Date(`${startDate}T00:00:00`), new Date(`${endDate}T00:00:00`)) : null;

  function handleChange(setter: (v: string) => void, value: string, otherValue: string) {
    setter(value);
    if (value && otherValue) AnalyticsEvents.toolUsed(TOOL_ID);
  }

  return (
    <Card className="p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="date-diff-start">Fecha inicial</Label>
          <Input
            id="date-diff-start"
            type="date"
            value={startDate}
            onChange={(e) => handleChange(setStartDate, e.target.value, endDate)}
          />
        </div>
        <div>
          <Label htmlFor="date-diff-end">Fecha final</Label>
          <Input id="date-diff-end" type="date" value={endDate} onChange={(e) => handleChange(setEndDate, e.target.value, startDate)} />
        </div>
      </div>

      {result && !result.ok && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {result.error}
        </p>
      )}

      {result?.ok && (
        <div className="mt-6">
          <div className="rounded-2xl bg-emerald-50 px-5 py-8 text-center">
            <p className="text-4xl font-bold text-slate-900">
              {result.value.totalDays.toLocaleString("es")} <span className="text-lg font-medium text-slate-500">días</span>
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {result.value.years} años, {result.value.months} meses y {result.value.days} días
            </p>
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
            <p className="text-xl font-semibold text-slate-900">
              {result.value.weeks} semana{result.value.weeks === 1 ? "" : "s"}
              {result.value.remainderDays > 0 && ` y ${result.value.remainderDays} día${result.value.remainderDays === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">Calculado en tu navegador — tus fechas nunca se envían a ningún servidor.</p>
    </Card>
  );
}
