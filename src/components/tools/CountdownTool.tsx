"use client";

import { useEffect, useId, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { computeCountdown } from "@/lib/productividad/countdown";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "productividad-cuenta-regresiva";

function defaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4 text-center">
      <p className="text-3xl font-bold tabular-nums text-slate-900">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

export function CountdownTool() {
  const id = useId();
  // Both start empty/null so the server-rendered HTML (frozen at build
  // time, since this page is statically generated) matches the client's
  // very first render exactly — "today" can be a different calendar day by
  // the time a real visitor's browser hydrates a statically built page, so
  // any `new Date()`-derived value has to wait until after mount.
  const [date, setDate] = useState("");
  const [time, setTime] = useState("00:00");
  const [label, setLabel] = useState("");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDate(defaultDate());
      setNow(new Date());
    }, 0);
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  function handleDateChange(value: string) {
    setDate(value);
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const target = date ? new Date(`${date}T${time || "00:00"}:00`) : null;
  const result = target && now && !Number.isNaN(target.getTime()) ? computeCountdown(target, now) : null;

  return (
    <Card className="p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor={`${id}-date`}>Fecha</Label>
          <Input id={`${id}-date`} type="date" value={date} onChange={(e) => handleDateChange(e.target.value)} />
        </div>
        <div>
          <Label htmlFor={`${id}-time`}>Hora</Label>
          <Input id={`${id}-time`} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <div>
          <Label htmlFor={`${id}-label`}>Nombre del evento (opcional)</Label>
          <Input id={`${id}-label`} placeholder="Año Nuevo, examen, boda..." value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
      </div>

      {result && (
        <div className="mt-6">
          {label && <p className="mb-3 text-center text-lg font-semibold text-slate-900">{label}</p>}
          <p className="mb-3 text-center text-sm text-slate-500">
            {result.isPast ? "Tiempo transcurrido desde" : "Tiempo restante hasta"} el {date} {time}
          </p>
          <div className="grid grid-cols-4 gap-3">
            <Unit value={result.days} label="Días" />
            <Unit value={result.hours} label="Horas" />
            <Unit value={result.minutes} label="Minutos" />
            <Unit value={result.seconds} label="Segundos" />
          </div>
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">Calculado en tu navegador con tu hora local, actualizado cada segundo.</p>
    </Card>
  );
}
