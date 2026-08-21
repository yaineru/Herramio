"use client";

import { useId, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { arabicToRoman, romanToArabic } from "@/lib/converters/roman-numerals";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "conv-romanos";

export function RomanNumeralConverter() {
  const id = useId();
  const [arabicInput, setArabicInput] = useState("1994");
  const [romanInput, setRomanInput] = useState("");
  const [lastEdited, setLastEdited] = useState<"arabic" | "roman">("arabic");

  const arabicNum = Number(arabicInput);
  const romanFromArabic = arabicInput.trim() !== "" && Number.isInteger(arabicNum) ? arabicToRoman(arabicNum) : null;
  const arabicFromRoman = romanInput.trim() !== "" ? romanToArabic(romanInput) : null;

  const isArabicMode = lastEdited === "arabic";

  function handleArabicChange(value: string) {
    setArabicInput(value);
    setLastEdited("arabic");
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  function handleRomanChange(value: string) {
    setRomanInput(value);
    setLastEdited("roman");
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const arabicError = isArabicMode && arabicInput.trim() !== "" && romanFromArabic === null;
  const romanError = !isArabicMode && romanInput.trim() !== "" && arabicFromRoman === null;

  return (
    <Card className="p-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${id}-arabic`}>Número arábigo</Label>
          <Input
            id={`${id}-arabic`}
            value={isArabicMode ? arabicInput : String(arabicFromRoman ?? "")}
            onChange={(e) => handleArabicChange(e.target.value)}
            placeholder="1994"
          />
          {arabicError && <p className="mt-1 text-xs text-red-700">Escribe un número entero entre 1 y 3999.</p>}
        </div>
        <div>
          <Label htmlFor={`${id}-roman`}>Número romano</Label>
          <Input
            id={`${id}-roman`}
            value={isArabicMode ? (romanFromArabic ?? "") : romanInput}
            onChange={(e) => handleRomanChange(e.target.value)}
            placeholder="MCMXCIV"
            className="uppercase"
          />
          {romanError && <p className="mt-1 text-xs text-red-700">Ese no es un número romano válido.</p>}
        </div>
      </div>

      {isArabicMode && romanFromArabic !== null && (
        <div className="mt-6 rounded-2xl bg-emerald-50 px-5 py-6 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Equivale a</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{romanFromArabic}</p>
        </div>
      )}
      {!isArabicMode && arabicFromRoman !== null && (
        <div className="mt-6 rounded-2xl bg-emerald-50 px-5 py-6 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Equivale a</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{arabicFromRoman}</p>
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">
        Rango válido: del 1 al 3999 (el sistema de numeración romana clásico no representa números mayores).
        Calculado en tu navegador.
      </p>
    </Card>
  );
}
