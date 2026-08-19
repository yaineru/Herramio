"use client";

import { useId, useState } from "react";
import { Info, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { calculateBmi, type BmiCategory } from "@/lib/calculators/bmi";
import { cn } from "@/lib/utils";

const CATEGORY_TONE: Record<BmiCategory, string> = {
  "bajo-peso": "bg-blue-50 text-blue-700",
  normal: "bg-emerald-50 text-emerald-700",
  sobrepeso: "bg-amber-50 text-amber-700",
  obesidad: "bg-red-50 text-red-700",
};

export function BmiCalculator() {
  const id = useId();
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const weightNum = Number(weight);
  const heightNum = Number(height);
  const hasInput = weight.trim() !== "" && height.trim() !== "";
  const isInvalid = hasInput && (!Number.isFinite(weightNum) || !Number.isFinite(heightNum) || weightNum <= 0 || heightNum <= 0);
  const result = hasInput && !isInvalid ? calculateBmi(weightNum, heightNum) : null;

  function handleClear() {
    setWeight("");
    setHeight("");
  }

  return (
    <Card className="p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${id}-weight`}>Peso (kg)</Label>
          <Input
            id={`${id}-weight`}
            type="number"
            inputMode="decimal"
            placeholder="70"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${id}-height`}>Altura (cm)</Label>
          <Input
            id={`${id}-height`}
            type="number"
            inputMode="decimal"
            placeholder="175"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6">
        {!hasInput && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Completa tu peso y altura para calcular tu IMC.
          </p>
        )}

        {isInvalid && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Ingresa valores positivos válidos para peso y altura.
          </p>
        )}

        {result && (
          <div className={cn("rounded-2xl px-5 py-6 text-center", CATEGORY_TONE[result.category])}>
            <p className="text-xs font-medium uppercase tracking-wide opacity-80">Tu IMC</p>
            <p className="mt-1 text-4xl font-bold text-slate-900">{result.bmi.toFixed(1)}</p>
            <p className="mt-1.5 text-sm font-medium">{result.categoryLabel}</p>
          </div>
        )}
      </div>

      {result && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          El IMC es una medida orientativa basada solo en peso y altura, y no constituye una
          evaluación médica. Para una valoración de tu salud, consulta a un profesional.
        </p>
      )}

      <div className="mt-5">
        <Button type="button" variant="ghost" onClick={handleClear} disabled={!hasInput}>
          <RotateCcw className="h-4 w-4" /> Limpiar
        </Button>
      </div>
    </Card>
  );
}
