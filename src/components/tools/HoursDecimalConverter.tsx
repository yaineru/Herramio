"use client";

import { useId, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { hoursMinutesToDecimal, decimalToHoursMinutes, sumTimeEntries } from "@/lib/productividad/hours-decimal";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "productividad-horas-decimal";

interface Entry {
  hours: string;
  minutes: string;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("es", { maximumFractionDigits: 2 }).format(n);
}

export function HoursDecimalConverter() {
  const id = useId();
  const [entries, setEntries] = useState<Entry[]>([{ hours: "", minutes: "" }]);

  function updateEntry(index: number, patch: Partial<Entry>) {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  function addEntry() {
    if (entries.length >= 10) return;
    setEntries((prev) => [...prev, { hours: "", minutes: "" }]);
  }

  function removeEntry(index: number) {
    if (entries.length <= 1) return;
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }

  const parsedEntries = entries
    .filter((e) => e.hours.trim() !== "" || e.minutes.trim() !== "")
    .map((e) => ({ hours: Number(e.hours || 0), minutes: Number(e.minutes || 0) }));

  const perEntryDecimals = parsedEntries.map((e) => hoursMinutesToDecimal(e.hours, e.minutes));
  const hasInvalid = perEntryDecimals.some((d) => d === null);
  const total = !hasInvalid && parsedEntries.length > 0 ? sumTimeEntries(parsedEntries) : null;
  const totalHm = total !== null ? decimalToHoursMinutes(total) : null;

  return (
    <Card className="p-6">
      <div className="space-y-3">
        {entries.map((entry, i) => {
          const decimal = entry.hours.trim() !== "" || entry.minutes.trim() !== ""
            ? hoursMinutesToDecimal(Number(entry.hours || 0), Number(entry.minutes || 0))
            : null;
          return (
            <div key={i} className="flex items-end gap-3">
              <div className="flex-1">
                <Label htmlFor={`${id}-h-${i}`}>{i === 0 ? "Horas" : ""}</Label>
                <Input
                  id={`${id}-h-${i}`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="8"
                  value={entry.hours}
                  onChange={(e) => updateEntry(i, { hours: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor={`${id}-m-${i}`}>{i === 0 ? "Minutos" : ""}</Label>
                <Input
                  id={`${id}-m-${i}`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={59}
                  placeholder="30"
                  value={entry.minutes}
                  onChange={(e) => updateEntry(i, { minutes: e.target.value })}
                />
              </div>
              <div className="w-24 shrink-0 pb-2.5 text-sm text-slate-500">
                {decimal !== null ? `= ${fmt(decimal)} h` : ""}
              </div>
              {entries.length > 1 && (
                <button type="button" onClick={() => removeEntry(i)} aria-label="Quitar fila" className="mb-2.5 shrink-0 text-slate-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
        {entries.length < 10 && (
          <Button type="button" variant="ghost" size="sm" onClick={addEntry}>
            <Plus className="h-3.5 w-3.5" /> Añadir otra fila
          </Button>
        )}
      </div>

      <div className="mt-6">
        {hasInvalid && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Los minutos deben estar entre 0 y 59.
          </p>
        )}
        {!hasInvalid && total !== null && totalHm && (
          <div className="rounded-2xl bg-emerald-50 px-5 py-6 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Total</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{fmt(total)} h</p>
            <p className="mt-1 text-sm text-slate-600">
              ({totalHm.hours}h {totalHm.minutes}m)
            </p>
          </div>
        )}
        {!hasInvalid && total === null && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Añade horas y minutos para ver el total en decimal.
          </p>
        )}
      </div>

      <p className="mt-5 text-xs text-slate-400">
        Útil para hojas de horas y nóminas — calculado en tu navegador, sin enviar datos a ningún servidor.
      </p>
    </Card>
  );
}
