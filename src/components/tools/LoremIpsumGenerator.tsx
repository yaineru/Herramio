"use client";

import { useEffect, useId, useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { generateLoremIpsum, type LoremUnit } from "@/lib/text/lorem-ipsum";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "texto-lorem-ipsum";

export function LoremIpsumGenerator() {
  const id = useId();
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState<LoremUnit>("parrafos");
  const [startClassic, setStartClassic] = useState(true);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  function regenerate() {
    setText(generateLoremIpsum(count, unit, startClassic));
    setCopied(false);
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  useEffect(() => {
    AnalyticsEvents.toolOpened(TOOL_ID);
    // Random text can't be produced during the initial render (server and
    // client would disagree, causing a hydration mismatch) — generating it
    // in a deferred callback after mount is the correct pattern here, not
    // just a way around the lint rule.
    const timeout = setTimeout(() => setText(generateLoremIpsum(3, "parrafos", true)), 0);
    return () => clearTimeout(timeout);
  }, []);

  async function handleCopy() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <Card className="p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor={`${id}-count`}>Cantidad</Label>
          <Input id={`${id}-count`} type="number" min={1} max={500} value={count} onChange={(e) => setCount(Number(e.target.value))} />
        </div>
        <div>
          <Label htmlFor={`${id}-unit`}>Unidad</Label>
          <Select id={`${id}-unit`} value={unit} onChange={(e) => setUnit(e.target.value as LoremUnit)}>
            <option value="palabras">Palabras</option>
            <option value="oraciones">Oraciones</option>
            <option value="parrafos">Párrafos</option>
          </Select>
        </div>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={startClassic} onChange={(e) => setStartClassic(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
            Empezar con &quot;Lorem ipsum...&quot;
          </label>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button type="button" onClick={regenerate}>
          <RefreshCw className="h-4 w-4" /> Generar
        </Button>
        <Button type="button" variant="outline" onClick={handleCopy} disabled={!text}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{text}</p>
      </div>
    </Card>
  );
}
