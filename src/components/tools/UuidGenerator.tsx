"use client";

import { useEffect, useId, useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { generateUuids } from "@/lib/dev/uuid";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "dev-uuid-generator";

export function UuidGenerator() {
  const id = useId();
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  function regenerate(next: number = count) {
    setUuids(generateUuids(next));
    setCopied(false);
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  useEffect(() => {
    AnalyticsEvents.toolOpened(TOOL_ID);
    // Deferred to after mount for the same hydration-safety reason as the
    // password generator: random content can't be produced during SSR.
    const timeout = setTimeout(() => regenerate(count), 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCopy() {
    if (uuids.length === 0) return;
    try {
      await navigator.clipboard.writeText(uuids.join("\n"));
      setCopied(true);
      AnalyticsEvents.copyLink(TOOL_ID);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor={`${id}-count`}>Cantidad (1-100)</Label>
          <input
            id={`${id}-count`}
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
            className="w-28 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <Button type="button" onClick={() => regenerate()}>
          <RefreshCw className="h-4 w-4" /> Generar
        </Button>
        <Button type="button" variant="outline" onClick={handleCopy} disabled={uuids.length === 0}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado" : "Copiar todos"}
        </Button>
      </div>

      {uuids.length > 0 && (
        <div className="mt-5 space-y-1.5">
          {uuids.map((u) => (
            <output key={u} className="block break-all rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-800">
              {u}
            </output>
          ))}
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">
        UUID versión 4 generados con <code>crypto.randomUUID()</code>, la API nativa de tu navegador. No se envían ni se guardan en ningún servidor.
      </p>
    </Card>
  );
}
