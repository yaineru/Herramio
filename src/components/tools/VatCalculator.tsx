"use client";

import { useId, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { addVat, removeVat } from "@/lib/calculators/vat";
import { cn } from "@/lib/utils";

function fmt(n: number): string {
  return new Intl.NumberFormat("es", { maximumFractionDigits: 2 }).format(n);
}

type Mode = "add" | "remove";

export function VatCalculator() {
  const id = useId();
  const [mode, setMode] = useState<Mode>("add");
  const [price, setPrice] = useState("");
  const [vatPercent, setVatPercent] = useState("19");

  const priceNum = Number(price);
  const vatNum = Number(vatPercent);
  const hasInput = price.trim() !== "" && vatPercent.trim() !== "";
  const isInvalid = hasInput && (!Number.isFinite(priceNum) || !Number.isFinite(vatNum) || priceNum < 0 || vatNum < 0);
  const result = hasInput && !isInvalid ? (mode === "add" ? addVat(priceNum, vatNum) : removeVat(priceNum, vatNum)) : null;

  return (
    <Card className="p-6">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
        {(["add", "remove"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
              m === mode ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:bg-white/60 hover:text-slate-700",
            )}
          >
            {m === "add" ? "Calcular con IVA" : "Calcular sin IVA"}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${id}-price`}>{mode === "add" ? "Precio sin IVA" : "Precio con IVA"}</Label>
          <Input id={`${id}-price`} type="number" inputMode="decimal" placeholder="100" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <Label htmlFor={`${id}-vat`}>IVA (%)</Label>
          <Input id={`${id}-vat`} type="number" inputMode="decimal" placeholder="19" value={vatPercent} onChange={(e) => setVatPercent(e.target.value)} />
        </div>
      </div>

      <div className="mt-6">
        {!hasInput && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Completa el precio y el porcentaje de IVA.
          </p>
        )}
        {isInvalid && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Ingresa valores positivos válidos.
          </p>
        )}
        {result && (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-50 px-3 py-5 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Base</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{fmt(result.base)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-5 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">IVA</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{fmt(result.vatAmount)}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-3 py-5 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Total</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{fmt(result.total)}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
