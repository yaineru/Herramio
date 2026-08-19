"use client";

import { useId, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { convertUnits } from "@/lib/converters/units";

const UNITS = [
  { id: "c", label: "Celsius (°C)" },
  { id: "f", label: "Fahrenheit (°F)" },
  { id: "k", label: "Kelvin (K)" },
];

function fmt(n: number): string {
  return new Intl.NumberFormat("es", { maximumFractionDigits: 2 }).format(n);
}

export function TemperatureConverter() {
  const id = useId();
  const [value, setValue] = useState("0");
  const [from, setFrom] = useState("c");
  const [to, setTo] = useState("f");

  const numValue = Number(value);
  const isInvalid = value.trim() !== "" && !Number.isFinite(numValue);
  const result = value.trim() !== "" && !isInvalid ? convertUnits("temperatura", from, to, numValue) : null;

  function handleSwap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <Card className="p-6">
      <div>
        <Label htmlFor={`${id}-value`}>Temperatura</Label>
        <Input id={`${id}-value`} type="number" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
      </div>

      <div className="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <Label htmlFor={`${id}-from`}>De</Label>
          <Select id={`${id}-from`} value={from} onChange={(e) => setFrom(e.target.value)}>
            {UNITS.map((u) => (
              <option key={u.id} value={u.id}>{u.label}</option>
            ))}
          </Select>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleSwap} aria-label="Intercambiar unidades" className="mb-0.5 justify-self-center">
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
        <div>
          <Label htmlFor={`${id}-to`}>A</Label>
          <Select id={`${id}-to`} value={to} onChange={(e) => setTo(e.target.value)}>
            {UNITS.map((u) => (
              <option key={u.id} value={u.id}>{u.label}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6">
        {isInvalid && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">Ingresa un número válido.</p>
        )}
        {result !== null && !isInvalid && (
          <div className="rounded-2xl bg-emerald-50 px-5 py-6 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Resultado</p>
            <p className="mt-1 text-4xl font-bold text-slate-900">
              {fmt(result)}
              {to === "k" ? " K" : `°${to.toUpperCase()}`}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
