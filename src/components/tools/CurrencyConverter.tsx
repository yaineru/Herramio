"use client";

import { useEffect, useId, useState } from "react";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import {
  SUPPORTED_CURRENCIES,
  convertCurrency,
  fetchCurrencyRates,
  type CurrencyCode,
  type CurrencyRates,
} from "@/lib/converters/currency";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "conv-moneda";

function fmt(n: number): string {
  return new Intl.NumberFormat("es", { maximumFractionDigits: 4 }).format(n);
}

export function CurrencyConverter() {
  const id = useId();
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState<CurrencyCode>("USD");
  const [to, setTo] = useState<CurrencyCode>("EUR");
  const [rates, setRates] = useState<CurrencyRates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AnalyticsEvents.toolOpened(TOOL_ID);
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Deferred so the setState calls below run as a reaction to the
    // microtask, not synchronously during the effect's own execution.
    queueMicrotask(() => {
      if (cancelled) return;
      setIsLoading(true);
      setError(null);
      fetchCurrencyRates(from)
        .then((result) => {
          if (!cancelled) {
            setRates(result);
            AnalyticsEvents.toolUsed(TOOL_ID);
          }
        })
        .catch((err: Error) => {
          if (!cancelled) {
            setError(err.message);
            AnalyticsEvents.toolError(TOOL_ID, err.message);
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [from]);

  function handleSwap() {
    setFrom(to);
    setTo(from);
  }

  const amountNum = Number(amount);
  const isInvalidAmount = amount.trim() !== "" && (!Number.isFinite(amountNum) || amountNum < 0);
  const rate = rates?.rates[to];
  const result = rate !== undefined && !isInvalidAmount && amount.trim() !== "" ? convertCurrency(amountNum, rate) : null;

  return (
    <Card className="p-6">
      <div>
        <Label htmlFor={`${id}-amount`}>Cantidad</Label>
        <Input id={`${id}-amount`} type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>

      <div className="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <Label htmlFor={`${id}-from`}>De</Label>
          <Select id={`${id}-from`} value={from} onChange={(e) => setFrom(e.target.value as CurrencyCode)}>
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleSwap} aria-label="Intercambiar monedas" className="mb-0.5 justify-self-center">
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
        <div>
          <Label htmlFor={`${id}-to`}>A</Label>
          <Select id={`${id}-to`} value={to} onChange={(e) => setTo(e.target.value as CurrencyCode)}>
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6">
        {isLoading && (
          <p className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Obteniendo tipo de cambio…
          </p>
        )}
        {error && !isLoading && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>
        )}
        {isInvalidAmount && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">Ingresa una cantidad válida.</p>
        )}
        {result !== null && !isLoading && !error && (
          <div className="rounded-2xl bg-emerald-50 px-5 py-6 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Resultado</p>
            <p className="mt-1 text-4xl font-bold text-slate-900">{fmt(result)} {to}</p>
            {rates && <p className="mt-1.5 text-xs text-slate-500">1 {from} = {fmt(rate!)} {to} · actualizado {rates.date}</p>}
          </div>
        )}
      </div>

      <p className="mt-5 text-xs text-slate-400">
        Tasas de referencia del Banco Central Europeo, actualizadas diariamente — no son tasas de
        trading en tiempo real. Cobertura limitada a ~30 monedas principales (no incluye COP, ARS,
        CLP ni PEN, ya que esta fuente de datos no las publica).
      </p>
    </Card>
  );
}
