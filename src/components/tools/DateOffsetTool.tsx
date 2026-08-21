"use client";

import { useId, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { addToDate, type DateUnit } from "@/lib/productividad/date-offset";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "productividad-fecha-futura";

const UNIT_LABELS: Record<DateUnit, string> = {
  days: "días",
  weeks: "semanas",
  months: "meses",
  years: "años",
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function fmt(date: Date): string {
  return new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
}

export function DateOffsetTool() {
  const id = useId();
  const [date, setDate] = useState(todayIso());
  const [amount, setAmount] = useState("30");
  const [unit, setUnit] = useState<DateUnit>("days");
  const [direction, setDirection] = useState<"add" | "subtract">("add");

  function track() {
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const hasInput = date.trim() !== "" && amount.trim() !== "";
  const parsedAmount = Number(amount);
  const isInvalid = hasInput && (!Number.isFinite(parsedAmount) || Number.isNaN(new Date(`${date}T00:00:00`).getTime()));
  const result =
    hasInput && !isInvalid
      ? addToDate(new Date(`${date}T00:00:00`), direction === "add" ? parsedAmount : -parsedAmount, unit)
      : null;

  return (
    <Card className="p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${id}-date`}>Fecha de inicio</Label>
          <Input id={`${id}-date`} type="date" value={date} onChange={(e) => { setDate(e.target.value); track(); }} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor={`${id}-amount`}>Cantidad</Label>
            <Input id={`${id}-amount`} type="number" inputMode="numeric" min={0} step={1} value={amount} onChange={(e) => { setAmount(e.target.value); track(); }} />
          </div>
          <div className="flex-1">
            <Label htmlFor={`${id}-unit`}>Unidad</Label>
            <Select id={`${id}-unit`} value={unit} onChange={(e) => { setUnit(e.target.value as DateUnit); track(); }}>
              {(Object.keys(UNIT_LABELS) as DateUnit[]).map((u) => (
                <option key={u} value={u}>{UNIT_LABELS[u]}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-4 flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        {(
          [
            { value: "add", label: "Sumar (fecha futura)" },
            { value: "subtract", label: "Restar (fecha pasada)" },
          ] as { value: "add" | "subtract"; label: string }[]
        ).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => { setDirection(opt.value); track(); }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${direction === opt.value ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {isInvalid && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Ingresa una fecha y una cantidad válidas.
          </p>
        )}
        {result && (
          <div className="rounded-2xl bg-emerald-50 px-5 py-6 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Fecha resultante</p>
            <p className="mt-1 text-2xl font-bold capitalize text-slate-900">{fmt(result)}</p>
          </div>
        )}
      </div>

      <p className="mt-5 text-xs text-slate-400">Calculado en tu navegador.</p>
    </Card>
  );
}
