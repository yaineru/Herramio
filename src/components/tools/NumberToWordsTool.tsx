"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { numberToWords } from "@/lib/text/number-to-words";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "conv-numero-a-letras";

export function NumberToWordsTool() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  function handleChange(value: string) {
    setInput(value);
    if (value.trim() && numberToWords(Number(value)) !== null) AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const hasInput = input.trim() !== "";
  const words = hasInput ? numberToWords(Number(input)) : null;
  const isInvalid = hasInput && words === null;

  async function handleCopy() {
    if (!words) return;
    try {
      await navigator.clipboard.writeText(words);
      setCopied(true);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <Card className="p-6">
      <Label htmlFor="number-input">Número</Label>
      <Input
        id="number-input"
        type="number"
        inputMode="numeric"
        min={0}
        max={999999999}
        step={1}
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="1234567"
      />

      <div className="mt-4">
        {!hasInput && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Escribe un número entero entre 0 y 999.999.999.
          </p>
        )}
        {isInvalid && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Ingresa un número entero entre 0 y 999.999.999.
          </p>
        )}
        {words && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-lg capitalize text-slate-900">{words}</p>
            <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
        )}
      </div>

      <p className="mt-5 text-xs text-slate-400">
        Útil para cheques, contratos y facturas. Calculado en tu navegador.
      </p>
    </Card>
  );
}
