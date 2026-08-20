"use client";

import { useState } from "react";
import { Check, Copy, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { buildBoxShadowCss, type ShadowLayer } from "@/lib/dev/css-box-shadow";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "dev-sombra-css";

function defaultLayer(): ShadowLayer {
  return { x: 4, y: 4, blur: 12, spread: 0, color: "#000000", alpha: 0.25, inset: false };
}

export function BoxShadowGenerator() {
  const [layers, setLayers] = useState<ShadowLayer[]>([defaultLayer()]);
  const [copied, setCopied] = useState(false);

  const css = buildBoxShadowCss(layers);
  const cssRule = `box-shadow: ${css};`;

  function updateLayer(index: number, patch: Partial<ShadowLayer>) {
    setLayers((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  function addLayer() {
    if (layers.length >= 4) return;
    setLayers((prev) => [...prev, defaultLayer()]);
  }

  function removeLayer(index: number) {
    if (layers.length <= 1) return;
    setLayers((prev) => prev.filter((_, i) => i !== index));
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
      <div className="flex h-40 items-center justify-center rounded-xl bg-slate-100">
        <div className="h-20 w-32 rounded-xl bg-white" style={{ boxShadow: css }} aria-hidden="true" />
      </div>

      <div className="mt-5 space-y-5">
        {layers.map((layer, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Sombra {i + 1}</p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={layer.inset}
                    onChange={(e) => updateLayer(i, { inset: e.target.checked })}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Interna (inset)
                </label>
                {layers.length > 1 && (
                  <button type="button" onClick={() => removeLayer(i)} aria-label="Quitar sombra" className="text-slate-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  { key: "x", label: "X", min: -50, max: 50 },
                  { key: "y", label: "Y", min: -50, max: 50 },
                  { key: "blur", label: "Desenfoque", min: 0, max: 100 },
                  { key: "spread", label: "Expansión", min: -30, max: 30 },
                ] as { key: "x" | "y" | "blur" | "spread"; label: string; min: number; max: number }[]
              ).map(({ key, label, min, max }) => (
                <div key={key}>
                  <Label htmlFor={`shadow-${i}-${key}`}>{label} ({layer[key]}px)</Label>
                  <input
                    id={`shadow-${i}-${key}`}
                    type="range"
                    min={min}
                    max={max}
                    value={layer[key]}
                    onChange={(e) => updateLayer(i, { [key]: Number(e.target.value) })}
                    className="mt-2 w-full accent-emerald-600"
                  />
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <input
                type="color"
                aria-label="Color de la sombra"
                value={layer.color}
                onChange={(e) => updateLayer(i, { color: e.target.value })}
                className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white p-0.5"
              />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={layer.alpha}
                onChange={(e) => updateLayer(i, { alpha: Number(e.target.value) })}
                className="flex-1 accent-emerald-600"
                aria-label="Opacidad de la sombra"
              />
              <span className="w-10 shrink-0 text-right text-xs text-slate-400">{Math.round(layer.alpha * 100)}%</span>
            </div>
          </div>
        ))}
        {layers.length < 4 && (
          <Button type="button" variant="ghost" size="sm" onClick={addLayer}>
            <Plus className="h-3.5 w-3.5" /> Añadir otra sombra
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
