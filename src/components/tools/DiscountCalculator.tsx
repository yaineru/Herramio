"use client";

import { useId, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { calculateDiscount } from "@/lib/calculators/discount";

function fmt(n: number): string {
  return new Intl.NumberFormat("es", { maximumFractionDigits: 2 }).format(n);
}

export function DiscountCalculator() {
  const id = useId();
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");

  const priceNum = Number(price);
  const discountNum = Number(discount);
  const hasInput = price.trim() !== "" && discount.trim() !== "";
  const isInvalid = hasInput && (!Number.isFinite(priceNum) || !Number.isFinite(discountNum) || priceNum < 0 || discountNum < 0);
  const result = hasInput && !isInvalid ? calculateDiscount(priceNum, discountNum) : null;

  return (
    <Card className="p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${id}-price`}>Precio original</Label>
          <Input id={`${id}-price`} type="number" inputMode="decimal" placeholder="100" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <Label htmlFor={`${id}-discount`}>Descuento (%)</Label>
          <Input id={`${id}-discount`} type="number" inputMode="decimal" placeholder="20" value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </div>
      </div>

      <div className="mt-6">
        {!hasInput && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Completa el precio y el porcentaje de descuento.
          </p>
        )}
        {isInvalid && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Ingresa valores positivos válidos.
          </p>
        )}
        {result && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-5 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Ahorras</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{fmt(result.savings)}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-5 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Precio final</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{fmt(result.finalPrice)}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
