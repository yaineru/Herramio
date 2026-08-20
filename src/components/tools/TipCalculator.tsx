"use client";

import { useId, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { calculateTip } from "@/lib/finanzas/tip";
import { cn } from "@/lib/utils";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "finanzas-propina";

function fmt(n: number): string {
  return new Intl.NumberFormat("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

const TIP_PRESETS = [10, 15, 20];

export function TipCalculator() {
  const id = useId();
  const [bill, setBill] = useState("");
  const [tipPercent, setTipPercent] = useState("10");
  const [people, setPeople] = useState("1");

  function track(nextBill: string, nextTip: string, nextPeople: string) {
    if (nextBill.trim() === "" || nextTip.trim() === "" || nextPeople.trim() === "") return;
    if (calculateTip(Number(nextBill), Number(nextTip), Number(nextPeople))) AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const billNum = Number(bill);
  const peopleNum = Number(people);
  const hasInput = bill.trim() !== "" && tipPercent.trim() !== "" && people.trim() !== "";
  const result = hasInput ? calculateTip(billNum, Number(tipPercent), peopleNum) : null;
  const isInvalid = hasInput && result === null;

  return (
    <Card className="p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${id}-bill`}>Cuenta total</Label>
          <Input
            id={`${id}-bill`}
            type="number"
            inputMode="decimal"
            min={0}
            placeholder="0.00"
            value={bill}
            onChange={(e) => {
              setBill(e.target.value);
              track(e.target.value, tipPercent, people);
            }}
          />
        </div>
        <div>
          <Label htmlFor={`${id}-people`}>Número de personas</Label>
          <Input
            id={`${id}-people`}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={people}
            onChange={(e) => {
              setPeople(e.target.value);
              track(bill, tipPercent, e.target.value);
            }}
          />
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor={`${id}-tip`}>Propina</Label>
        <div className="flex flex-wrap items-center gap-2">
          {TIP_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setTipPercent(String(p));
                track(bill, String(p), people);
              }}
              className={cn(
                "rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                Number(tipPercent) === p
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              {p}%
            </button>
          ))}
          <Input
            id={`${id}-tip`}
            type="number"
            inputMode="decimal"
            min={0}
            className="w-24"
            value={tipPercent}
            onChange={(e) => {
              setTipPercent(e.target.value);
              track(bill, e.target.value, people);
            }}
          />
        </div>
      </div>

      <div className="mt-6">
        {!hasInput && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Completa la cuenta, la propina y el número de personas.
          </p>
        )}
        {isInvalid && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Ingresa solo números válidos y positivos.
          </p>
        )}
        {result && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50 px-5 py-6 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Propina total</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{fmt(result.tipAmount)}</p>
            </div>
            <div className="rounded-2xl bg-slate-900 px-5 py-6 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-300">Total a pagar</p>
              <p className="mt-1 text-3xl font-bold text-white">{fmt(result.totalAmount)}</p>
            </div>
            {peopleNum > 1 && (
              <>
                <div className="rounded-2xl border border-slate-200 px-5 py-4 text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Propina por persona</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">{fmt(result.perPersonTip)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 px-5 py-4 text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total por persona</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">{fmt(result.perPersonTotal)}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
