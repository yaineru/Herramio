"use client";

import { useMemo, useState } from "react";
import { GitCompareArrows, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { diffWords, type DiffToken } from "@/lib/pdf/pdf-diff";
import { AnalyticsEvents } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const TOOL_ID = "texto-comparar";

function DiffView({ tokens }: { tokens: DiffToken[] }) {
  return (
    <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
      {tokens.map((token, i) => (
        <span
          key={i}
          className={cn(
            token.type === "added" && "rounded bg-emerald-200 text-emerald-900",
            token.type === "removed" && "rounded bg-red-200 text-red-900 line-through",
          )}
        >
          {token.value}
        </span>
      ))}
    </div>
  );
}

export function TextCompare() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");

  const { tokens, error } = useMemo<{ tokens: DiffToken[] | null; error: string | null }>(() => {
    if (textA.trim() === "" && textB.trim() === "") return { tokens: null, error: null };
    try {
      return { tokens: diffWords(textA, textB), error: null };
    } catch (err) {
      return { tokens: null, error: err instanceof Error ? err.message : "No se pudieron comparar los textos." };
    }
  }, [textA, textB]);

  function handleReset() {
    setTextA("");
    setTextB("");
  }

  function handleChangeA(value: string) {
    setTextA(value);
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  function handleChangeB(value: string) {
    setTextB(value);
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const addedCount = tokens?.filter((t) => t.type === "added" && t.value.trim() !== "").length ?? 0;
  const removedCount = tokens?.filter((t) => t.type === "removed" && t.value.trim() !== "").length ?? 0;

  return (
    <Card className="p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Texto A</p>
          <Textarea value={textA} onChange={(e) => handleChangeA(e.target.value)} rows={8} placeholder="Pega el primer texto aquí…" />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Texto B</p>
          <Textarea value={textB} onChange={(e) => handleChangeB(e.target.value)} rows={8} placeholder="Pega el segundo texto aquí…" />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {tokens && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
              <GitCompareArrows className="h-3.5 w-3.5" /> Diferencias
            </p>
            <p className="text-xs text-slate-400">
              <span className="text-emerald-700">+{addedCount}</span> · <span className="text-red-700">-{removedCount}</span>
            </p>
          </div>
          <DiffView tokens={tokens} />
        </div>
      )}

      {(textA || textB) && (
        <div className="mt-6">
          <Button type="button" variant="ghost" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" /> Empezar de nuevo
          </Button>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        La comparación ocurre completamente en tu navegador: ningún texto se envía a ningún servidor.
      </p>
    </Card>
  );
}
