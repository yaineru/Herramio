"use client";

import { useState } from "react";
import { Dices, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { parseEntries, pickRandom } from "@/lib/productivity/raffle";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "productividad-sorteador";

export function RafflePicker() {
  const [input, setInput] = useState("");
  const [winner, setWinner] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [removeAfterDraw, setRemoveAfterDraw] = useState(false);

  const entries = parseEntries(input);

  function draw() {
    if (entries.length === 0) return;
    setIsDrawing(true);
    setWinner(null);
    const picked = pickRandom(entries);
    setTimeout(() => {
      setWinner(picked);
      setIsDrawing(false);
      if (picked) AnalyticsEvents.toolUsed(TOOL_ID);
      if (picked && removeAfterDraw) {
        setInput(entries.filter((e) => e !== picked).join("\n"));
      }
    }, 600);
  }

  function handleClear() {
    setInput("");
    setWinner(null);
  }

  return (
    <Card className="p-6">
      <Label htmlFor="raffle-input">Participantes (uno por línea)</Label>
      <textarea
        id="raffle-input"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setWinner(null);
        }}
        placeholder={"Ana\nBeto\nCarla\nDiego"}
        rows={8}
        className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />
      <p className="mt-1.5 text-xs text-slate-400">{entries.length} participante{entries.length === 1 ? "" : "s"}</p>

      <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={removeAfterDraw}
          onChange={(e) => setRemoveAfterDraw(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        Quitar al ganador de la lista tras sortear (para sorteos sucesivos)
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={draw} disabled={entries.length === 0 || isDrawing}>
          <Dices className="h-4 w-4" /> {isDrawing ? "Sorteando…" : "Sortear"}
        </Button>
        <Button type="button" variant="ghost" onClick={handleClear} disabled={!input}>
          <Trash2 className="h-4 w-4" /> Limpiar
        </Button>
      </div>

      {winner && (
        <div className="mt-6 rounded-2xl bg-emerald-50 px-5 py-8 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Ganador</p>
          <p className="mt-1 break-words text-3xl font-bold text-slate-900">{winner}</p>
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">
        El sorteo se realiza con el generador de números aleatorios de tu navegador, directamente
        en tu dispositivo — sin enviar la lista a ningún servidor.
      </p>
    </Card>
  );
}
