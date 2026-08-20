"use client";

import { useState } from "react";
import { Check, Copy, Dices, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { buildLinearGradientCss, type GradientStop } from "@/lib/dev/css-gradient";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "dev-gradiente-css";

const PRESETS: GradientStop[][] = [
  [{ color: "#10B981", position: 0 }, { color: "#3B82F6", position: 100 }],
  [{ color: "#F97316", position: 0 }, { color: "#EC4899", position: 100 }],
  [{ color: "#8B5CF6", position: 0 }, { color: "#06B6D4", position: 100 }],
  [{ color: "#F43F5E", position: 0 }, { color: "#FACC15", position: 100 }],
];

function randomHex(): string {
  return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0").toUpperCase()}`;
}

export function GradientGenerator() {
  const [stops, setStops] = useState<GradientStop[]>(PRESETS[0]);
  const [angle, setAngle] = useState(90);
  const [copied, setCopied] = useState(false);

  const css = buildLinearGradientCss(stops, angle);
  const cssRule = `background: ${css};`;

  function updateStop(index: number, patch: Partial<GradientStop>) {
    setStops((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  function addStop() {
    if (stops.length >= 5) return;
    setStops((prev) => [...prev, { color: randomHex(), position: 50 }]);
  }

  function removeStop(index: number) {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((_, i) => i !== index));
  }

  function randomize() {
    setStops((prev) => prev.map((s) => ({ ...s, color: randomHex() })));
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(cssRule);
      setCopied(true);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <Card className="p-6">
      <div
        className="h-40 w-full rounded-xl border border-slate-200"
        style={{ background: css }}
        aria-hidden="true"
      />

      <div className="mt-5 flex flex-wrap gap-2">
        {PRESETS.map((preset, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStops(preset)}
            className="h-8 w-8 rounded-full border-2 border-white shadow ring-1 ring-slate-200"
            style={{ background: buildLinearGradientCss(preset, angle) }}
            aria-label={`Preset de gradiente ${i + 1}`}
          />
        ))}
        <Button type="button" variant="outline" size="sm" onClick={randomize}>
          <Dices className="h-3.5 w-3.5" /> Aleatorio
        </Button>
      </div>

      <div className="mt-5">
        <Label htmlFor="gradient-angle">Ángulo ({angle}°)</Label>
        <input
          id="gradient-angle"
          type="range"
          min={0}
          max={360}
          value={angle}
          onChange={(e) => {
            setAngle(Number(e.target.value));
            AnalyticsEvents.toolUsed(TOOL_ID);
          }}
          className="mt-2 w-full accent-emerald-600"
        />
      </div>

      <div className="mt-5 space-y-3">
        {stops.map((stop, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <input
              type="color"
              aria-label={`Color ${i + 1}`}
              value={stop.color}
              onChange={(e) => updateStop(i, { color: e.target.value })}
              className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white p-0.5"
            />
            <input
              type="range"
              min={0}
              max={100}
              value={stop.position}
              onChange={(e) => updateStop(i, { position: Number(e.target.value) })}
              className="flex-1 accent-emerald-600"
              aria-label={`Posición del color ${i + 1}`}
            />
            <span className="w-10 shrink-0 text-right text-xs text-slate-400">{stop.position}%</span>
            {stops.length > 2 && (
              <button type="button" onClick={() => removeStop(i)} aria-label="Quitar color" className="shrink-0 text-slate-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        {stops.length < 5 && (
          <Button type="button" variant="ghost" size="sm" onClick={addStop}>
            + Añadir color
          </Button>
        )}
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">CSS</p>
          <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar CSS"}
          </Button>
        </div>
        <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800">
          <code>{cssRule}</code>
        </pre>
      </div>

      <p className="mt-4 text-xs text-slate-400">Generado en tu navegador — sin registro ni límites de uso.</p>
    </Card>
  );
}
