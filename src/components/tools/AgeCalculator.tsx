"use client";

import { useState } from "react";
import { Cake } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { calculateAge } from "@/lib/calculators/age";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "calc-edad";

export function AgeCalculator() {
  const [birthDate, setBirthDate] = useState("");

  const result = birthDate ? calculateAge(new Date(`${birthDate}T00:00:00`)) : null;

  function handleChange(value: string) {
    setBirthDate(value);
    if (value && calculateAge(new Date(`${value}T00:00:00`)).ok) AnalyticsEvents.toolUsed(TOOL_ID);
  }

  return (
    <Card className="p-6">
      <Label htmlFor="birth-date">Fecha de nacimiento</Label>
      <Input id="birth-date" type="date" value={birthDate} onChange={(e) => handleChange(e.target.value)} max={new Date().toISOString().slice(0, 10)} />

      {result && !result.ok && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {result.error}
        </p>
      )}

      {result?.ok && (
        <div className="mt-6">
          <div className="rounded-2xl bg-emerald-50 px-5 py-8 text-center">
            <Cake className="mx-auto h-6 w-6 text-emerald-600" />
            <p className="mt-2 text-4xl font-bold text-slate-900">
              {result.value.years} <span className="text-lg font-medium text-slate-500">años</span>
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {result.value.months} meses y {result.value.days} días más
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xl font-semibold text-slate-900">{result.value.totalDays.toLocaleString("es")}</p>
              <p className="text-xs text-slate-500">días vividos</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xl font-semibold text-slate-900">{result.value.daysUntilNextBirthday}</p>
              <p className="text-xs text-slate-500">días para tu próximo cumpleaños</p>
            </div>
          </div>
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">Calculado en tu navegador — tu fecha de nacimiento nunca se envía a ningún servidor.</p>
    </Card>
  );
}
