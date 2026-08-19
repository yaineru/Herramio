"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { parseColor, rgbToHex, rgbToHsl, rgbString, hslString } from "@/lib/dev/color";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "dev-color-picker";

export function ColorConverter() {
  const [input, setInput] = useState("#10B981");
  const [copied, setCopied] = useState<string | null>(null);

  const result = parseColor(input);

  function handleNativePicker(value: string) {
    setInput(value);
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  function handleTextChange(value: string) {
    setInput(value);
    if (parseColor(value).ok) AnalyticsEvents.toolUsed(TOOL_ID);
  }

  async function handleCopy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  const hex = result.ok ? rgbToHex(result.rgb) : null;
  const rgb = result.ok ? rgbString(result.rgb) : null;
  const hsl = result.ok ? hslString(rgbToHsl(result.rgb)) : null;

  return (
    <Card className="p-6">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Label htmlFor="color-text-input">Color (hex, rgb() o hsl())</Label>
          <Input
            id="color-text-input"
            value={input}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="#10B981, rgb(16,185,129) o hsl(160,84%,39%)"
            className="font-mono"
            spellCheck={false}
          />
        </div>
        <input
          type="color"
          aria-label="Selector de color"
          value={hex ?? "#10B981"}
          onChange={(e) => handleNativePicker(e.target.value)}
          className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
        />
      </div>

      {!result.ok && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {result.error}
        </p>
      )}

      {result.ok && hex && rgb && hsl && (
        <div className="mt-5 space-y-2">
          <div
            className="mb-3 h-20 w-full rounded-xl border border-slate-200"
            style={{ backgroundColor: hex }}
            aria-hidden="true"
          />
          {[
            { key: "hex", label: "HEX", value: hex },
            { key: "rgb", label: "RGB", value: rgb },
            { key: "hsl", label: "HSL", value: hsl },
          ].map(({ key, label, value }) => (
            <div key={key} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="w-12 shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
              <output className="flex-1 break-all font-mono text-sm text-slate-800">{value}</output>
              <Button type="button" variant="outline" size="sm" onClick={() => handleCopy(key, value)} aria-label={`Copiar ${label}`}>
                {copied === key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">
        Conversión instantánea entre HEX, RGB y HSL, calculada en tu navegador — no se envía a
        ningún servidor.
      </p>
    </Card>
  );
}
