"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCountdown } from "@/lib/productivity/time-format";
import { AnalyticsEvents } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const TOOL_ID = "productividad-temporizador";

const PRESETS = [
  { label: "Enfoque (25 min)", minutes: 25 },
  { label: "Descanso corto (5 min)", minutes: 5 },
  { label: "Descanso largo (15 min)", minutes: 15 },
  { label: "1 hora", minutes: 60 },
];

export function PomodoroTimer() {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    AnalyticsEvents.toolOpened(TOOL_ID);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    if (remaining !== 0) return;
    // Deferred: reacting to remaining hitting 0, not to the effect's own
    // synchronous execution — avoids a same-commit cascading setState.
    const timeout = setTimeout(() => {
      setIsRunning(false);
      setFinished(true);
      AnalyticsEvents.toolUsed(TOOL_ID);
    }, 0);
    return () => clearTimeout(timeout);
  }, [remaining]);

  function selectPreset(minutes: number) {
    setIsRunning(false);
    setFinished(false);
    setTotalSeconds(minutes * 60);
    setRemaining(minutes * 60);
  }

  function toggle() {
    if (remaining === 0) return;
    setFinished(false);
    setIsRunning((prev) => !prev);
  }

  function reset() {
    setIsRunning(false);
    setFinished(false);
    setRemaining(totalSeconds);
  }

  const progress = totalSeconds > 0 ? 1 - remaining / totalSeconds : 0;

  return (
    <Card className="p-6">
      <div className="mb-5 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => selectPreset(preset.minutes)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
              totalSeconds === preset.minutes * 60
                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                : "border-slate-200 text-slate-500 hover:border-slate-300",
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 py-10">
        <output
          className={cn("font-mono text-6xl font-bold tabular-nums", finished ? "text-emerald-600" : "text-slate-900")}
          aria-live="polite"
        >
          {formatCountdown(remaining)}
        </output>
        <div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-emerald-600 transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        {finished && <p className="mt-4 text-sm font-medium text-emerald-700">¡Tiempo terminado!</p>}
      </div>

      <div className="mt-5 flex justify-center gap-2">
        <Button type="button" onClick={toggle} disabled={remaining === 0}>
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isRunning ? "Pausar" : "Iniciar"}
        </Button>
        <Button type="button" variant="outline" onClick={reset}>
          <RotateCcw className="h-4 w-4" /> Reiniciar
        </Button>
      </div>

      <p className="mt-5 text-center text-xs text-slate-400">
        Mantén esta pestaña abierta para que el temporizador siga corriendo.
      </p>
    </Card>
  );
}
