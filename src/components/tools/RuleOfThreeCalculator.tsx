"use client";

import { useId, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { calculateRuleOfThree, type RuleOfThreeType } from "@/lib/calculators/rule-of-three";
import { cn } from "@/lib/utils";

function fmt(n: number): string {
  return new Intl.NumberFormat("es", { maximumFractionDigits: 4 }).format(n);
}

export function RuleOfThreeCalculator() {
  const id = useId();
  const [type, setType] = useState<RuleOfThreeType>("directa");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");

  const nums = [a, b, c].map(Number);
  const hasInput = a.trim() !== "" && b.trim() !== "" && c.trim() !== "";
  const isInvalid = hasInput && !nums.every(Number.isFinite);
  const result = hasInput && !isInvalid ? calculateRuleOfThree(nums[0], nums[1], nums[2], type) : null;
  const divisionByZero = hasInput && !isInvalid && result === null;

  return (
    <Card className="p-6">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
        {(["directa", "inversa"] as RuleOfThreeType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              "rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
              t === type ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:bg-white/60 hover:text-slate-700",
            )}
          >
            {t === "directa" ? "Proporción directa" : "Proporción inversa"}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm text-slate-500">
        A es a B, como C es a <span className="font-semibold text-slate-900">X</span>
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor={`${id}-a`}>A</Label>
          <Input id={`${id}-a`} type="number" inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} />
        </div>
        <div>
          <Label htmlFor={`${id}-b`}>B</Label>
          <Input id={`${id}-b`} type="number" inputMode="decimal" value={b} onChange={(e) => setB(e.target.value)} />
        </div>
        <div>
          <Label htmlFor={`${id}-c`}>C</Label>
          <Input id={`${id}-c`} type="number" inputMode="decimal" value={c} onChange={(e) => setC(e.target.value)} />
        </div>
      </div>

      <div className="mt-6">
        {!hasInput && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Completa los tres valores para calcular X.
          </p>
        )}
        {(isInvalid || divisionByZero) && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {divisionByZero ? "No se puede dividir entre cero con estos valores." : "Ingresa solo números válidos."}
          </p>
        )}
        {result !== null && (
          <div className="rounded-2xl bg-emerald-50 px-5 py-6 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">X =</p>
            <p className="mt-1 text-4xl font-bold text-slate-900">{fmt(result)}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
