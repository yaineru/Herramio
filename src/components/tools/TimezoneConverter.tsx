"use client";

import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TIME_ZONES, convertTimeZone } from "@/lib/converters/timezone";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "conv-zona-horaria";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const DAY_OFFSET_LABEL: Record<number, string> = {
  [-1]: "(día anterior)",
  0: "",
  1: "(día siguiente)",
};

export function TimezoneConverter() {
  const id = useId();
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState("12:00");
  const [fromZone, setFromZone] = useState("America/Bogota");
  const [toZone, setToZone] = useState("Europe/Madrid");

  function track() {
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const hasInput = Boolean(date) && Boolean(time);
  const result = hasInput ? convertTimeZone(year, month, day, hour, minute, fromZone, toZone) : null;
  const isInvalid = hasInput && result === null;

  return (
    <Card className="p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${id}-date`}>Fecha</Label>
          <Input
            id={`${id}-date`}
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              track();
            }}
          />
        </div>
        <div>
          <Label htmlFor={`${id}-time`}>Hora</Label>
          <Input
            id={`${id}-time`}
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              track();
            }}
          />
        </div>
      </div>

      <div className="mt-4 grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <Label htmlFor={`${id}-from`}>Zona de origen</Label>
          <Select
            id={`${id}-from`}
            value={fromZone}
            onChange={(e) => {
              setFromZone(e.target.value);
              track();
            }}
          >
            {TIME_ZONES.map((z) => (
              <option key={z.id} value={z.id}>
                {z.label}
              </option>
            ))}
          </Select>
        </div>
        <ArrowRight className="mb-2.5 hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
        <div>
          <Label htmlFor={`${id}-to`}>Zona de destino</Label>
          <Select
            id={`${id}-to`}
            value={toZone}
            onChange={(e) => {
              setToZone(e.target.value);
              track();
            }}
          >
            {TIME_ZONES.map((z) => (
              <option key={z.id} value={z.id}>
                {z.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6">
        {isInvalid && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            No se pudo convertir esta fecha y hora. Verifica los valores.
          </p>
        )}
        {result && (
          <div className="rounded-2xl bg-emerald-50 px-5 py-6 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Hora convertida</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{result.targetTime}</p>
            <p className="mt-1 text-sm text-slate-600">
              {result.targetDate} {DAY_OFFSET_LABEL[result.dayOffset] ?? ""}
            </p>
          </div>
        )}
      </div>

      <p className="mt-5 text-xs text-slate-400">
        La conversión tiene en cuenta el horario de verano de cada zona automáticamente y ocurre en tu navegador.
      </p>
    </Card>
  );
}
