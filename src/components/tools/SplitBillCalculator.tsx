"use client";

import { useId, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { splitBill } from "@/lib/finanzas/split-bill";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "finanzas-dividir-cuenta";

function fmt(n: number): string {
  return new Intl.NumberFormat("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function SplitBillCalculator() {
  const id = useId();
  const [subtotal, setSubtotal] = useState("");
  const [tipPercent, setTipPercent] = useState("0");
  const [people, setPeople] = useState("2");

  function track(nextSubtotal: string, nextTip: string, nextPeople: string) {
    if (nextSubtotal.trim() === "" || nextTip.trim() === "" || nextPeople.trim() === "") return;
    if (splitBill(Number(nextSubtotal), Number(nextTip), Number(nextPeople))) AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const hasInput = subtotal.trim() !== "" && tipPercent.trim() !== "" && people.trim() !== "";
  const result = hasInput ? splitBill(Number(subtotal), Number(tipPercent), Number(people)) : null;
  const isInvalid = hasInput && result === null;

  return (
    <Card className="p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor={`${id}-subtotal`}>Subtotal de la cuenta</Label>
          <Input
            id={`${id}-subtotal`}
            type="number"
            inputMode="decimal"
            min={0}
            placeholder="0.00"
            value={subtotal}
            onChange={(e) => {
              setSubtotal(e.target.value);
              track(e.target.value, tipPercent, people);
            }}
          />
        </div>
        <div>
          <Label htmlFor={`${id}-tip`}>Propina (%)</Label>
          <Input
            id={`${id}-tip`}
            type="number"
            inputMode="decimal"
            min={0}
            value={tipPercent}
            onChange={(e) => {
              setTipPercent(e.target.value);
              track(subtotal, e.target.value, people);
            }}
          />
        </div>
        <div>
          <Label htmlFor={`${id}-people`}>Personas</Label>
          <Input
            id={`${id}-people`}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={people}
            onChange={(e) => {
              setPeople(e.target.value);
              track(subtotal, tipPercent, e.target.value);
            }}
          />
        </div>
      </div>

      <div className="mt-6">
        {!hasInput && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Completa el subtotal, la propina y el número de personas.
          </p>
        )}
        {isInvalid && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Ingresa un subtotal y propina válidos, y un número entero de personas (mínimo 1).
          </p>
        )}
        {result && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 px-5 py-5 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Propina total</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{fmt(result.tipAmount)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 px-5 py-5 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total con propina</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{fmt(result.totalWithTip)}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-5 py-5 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Cada persona paga</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{fmt(result.perPerson)}</p>
            </div>
          </div>
        )}
      </div>

      <p className="mt-5 text-xs text-slate-400">Calculado en tu navegador — estos datos nunca se envían a ningún servidor.</p>
    </Card>
  );
}
