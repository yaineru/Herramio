"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Flag } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatStopwatch } from "@/lib/productivity/time-format";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "productividad-cronometro";

export function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    AnalyticsEvents.toolOpened(TOOL_ID);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    startRef.current = Date.now() - elapsed;
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - startRef.current);
    }, 31);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  function toggle() {
    if (!isRunning) AnalyticsEvents.toolUsed(TOOL_ID);
    setIsRunning((prev) => !prev);
  }

  function reset() {
    setIsRunning(false);
    setElapsed(0);
    setLaps([]);
  }

  function addLap() {
    setLaps((prev) => [elapsed, ...prev]);
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 py-10">
        <output className="font-mono text-6xl font-bold tabular-nums text-slate-900" aria-live="off">
          {formatStopwatch(elapsed)}
        </output>
      </div>

      <div className="mt-5 flex justify-center gap-2">
        <Button type="button" onClick={toggle}>
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isRunning ? "Pausar" : elapsed > 0 ? "Reanudar" : "Iniciar"}
        </Button>
        <Button type="button" variant="outline" onClick={addLap} disabled={!isRunning}>
          <Flag className="h-4 w-4" /> Vuelta
        </Button>
        <Button type="button" variant="ghost" onClick={reset} disabled={elapsed === 0 && laps.length === 0}>
          <RotateCcw className="h-4 w-4" /> Reiniciar
        </Button>
      </div>

      {laps.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Vueltas</p>
          <ol className="space-y-1">
            {laps.map((lap, i) => (
              <li key={laps.length - i} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-500">Vuelta {laps.length - i}</span>
                <span className="font-mono text-slate-800">{formatStopwatch(lap)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Card>
  );
}
