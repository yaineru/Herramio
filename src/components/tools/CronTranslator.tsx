"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { parseCronExpression, describeCron, nextRunTimes } from "@/lib/dev/cron";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "dev-cron";

const PRESETS = [
  { label: "Cada minuto", expr: "* * * * *" },
  { label: "Cada 15 minutos", expr: "*/15 * * * *" },
  { label: "Cada hora", expr: "0 * * * *" },
  { label: "Todos los días a las 9:00", expr: "0 9 * * *" },
  { label: "Lunes a viernes a las 8:00", expr: "0 8 * * 1-5" },
  { label: "El primer día de cada mes", expr: "0 0 1 * *" },
];

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat("es", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(d);
}

export function CronTranslator() {
  const [expression, setExpression] = useState("0 9 * * 1-5");

  function handleChange(value: string) {
    setExpression(value);
    if (parseCronExpression(value).ok) AnalyticsEvents.toolUsed(TOOL_ID);
  }

  const hasInput = expression.trim() !== "";
  const result = hasInput ? parseCronExpression(expression) : null;
  const description = result?.ok ? describeCron(result.value) : null;
  const runs = result?.ok ? nextRunTimes(result.value, new Date(), 5) : [];

  return (
    <Card className="p-6">
      <Label htmlFor="cron-input">Expresión cron</Label>
      <Input
        id="cron-input"
        value={expression}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="0 9 * * 1-5"
        className="font-mono"
        spellCheck={false}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.expr}
            type="button"
            onClick={() => handleChange(p.expr)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {result && !result.ok && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {result.error}
          </p>
        )}
        {description && (
          <div className="rounded-2xl bg-emerald-50 px-5 py-5">
            <p className="text-sm font-medium text-slate-900">{description}</p>
          </div>
        )}
        {runs.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Próximas 5 ejecuciones</p>
            <div className="space-y-1.5">
              {runs.map((run, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  {fmtDate(run)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="mt-5 text-xs text-slate-400">
        Las próximas ejecuciones se calculan en tu hora local y en tu navegador — nada se envía a ningún servidor.
      </p>
    </Card>
  );
}
