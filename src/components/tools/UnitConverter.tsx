"use client";

import { useId, useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { UNIT_CATEGORIES, convertUnits, type UnitCategoryId } from "@/lib/converters/units";
import { cn } from "@/lib/utils";

function formatResult(value: number): string {
  return new Intl.NumberFormat("es", { maximumFractionDigits: 6 }).format(value);
}

export function UnitConverter() {
  const id = useId();
  const [category, setCategory] = useState<UnitCategoryId>("longitud");
  const activeCategory = UNIT_CATEGORIES.find((c) => c.id === category)!;

  const [fromUnit, setFromUnit] = useState(activeCategory.units[0].id);
  const [toUnit, setToUnit] = useState(activeCategory.units[1].id);
  const [value, setValue] = useState("1");

  function handleCategoryChange(next: UnitCategoryId) {
    const def = UNIT_CATEGORIES.find((c) => c.id === next)!;
    setCategory(next);
    setFromUnit(def.units[0].id);
    setToUnit(def.units[1].id);
  }

  function handleSwap() {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }

  const numValue = Number(value);
  const isInvalid = value.trim() !== "" && !Number.isFinite(numValue);
  const result = useMemo(() => {
    if (value.trim() === "" || isInvalid) return null;
    return convertUnits(category, fromUnit, toUnit, numValue);
  }, [category, fromUnit, toUnit, numValue, value, isInvalid]);

  return (
    <Card className="p-6">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
        {UNIT_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => handleCategoryChange(c.id)}
            className={cn(
              "rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
              c.id === category
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500 hover:bg-white/60 hover:text-slate-700",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <Label htmlFor={`${id}-value`}>Cantidad</Label>
        <Input
          id={`${id}-value`}
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>

      <div className="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <Label htmlFor={`${id}-from`}>De</Label>
          <Select id={`${id}-from`} value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
            {activeCategory.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSwap}
          aria-label="Intercambiar unidades"
          className="mb-0.5 justify-self-center"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>

        <div>
          <Label htmlFor={`${id}-to`}>A</Label>
          <Select id={`${id}-to`} value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
            {activeCategory.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6">
        {isInvalid && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Ingresa un número válido.
          </p>
        )}
        {result !== null && !isInvalid && (
          <div className="rounded-2xl bg-emerald-50 px-5 py-6 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Resultado</p>
            <p className="mt-1 text-4xl font-bold text-slate-900">{formatResult(result)}</p>
            <p className="mt-1.5 text-sm text-slate-500">
              {value} {activeCategory.units.find((u) => u.id === fromUnit)?.label} ={" "}
              {formatResult(result)} {activeCategory.units.find((u) => u.id === toUnit)?.label}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
