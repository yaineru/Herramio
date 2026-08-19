"use client";

import { useEffect, useId, useState } from "react";
import { Check, Copy, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import {
  timestampToDate,
  dateToTimestamp,
  nowTimestamp,
  type TimestampUnit,
} from "@/lib/dev/timestamp";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "dev-timestamp-converter";

export function TimestampConverter() {
  const id = useId();
  const [timestampInput, setTimestampInput] = useState("");
  const [unit, setUnit] = useState<TimestampUnit>("seconds");
  const [dateInput, setDateInput] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    AnalyticsEvents.toolOpened(TOOL_ID);
  }, []);

  function handleNow() {
    const now = nowTimestamp();
    setTimestampInput(unit === "seconds" ? String(now.seconds) : String(now.milliseconds));
    AnalyticsEvents.toolUsed(TOOL_ID);
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

  const tsResult = timestampInput.trim() ? timestampToDate(timestampInput, unit) : null;
  const dateResult = dateInput.trim() ? dateToTimestamp(dateInput) : null;

  useEffect(() => {
    if (tsResult?.ok) AnalyticsEvents.toolUsed(TOOL_ID);
  }, [tsResult?.ok, tsResult?.iso]);

  useEffect(() => {
    if (dateResult?.ok) AnalyticsEvents.toolUsed(TOOL_ID);
  }, [dateResult?.ok, dateResult?.milliseconds]);

  return (
    <Card className="p-6">
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor={`${id}-ts`}>Timestamp Unix → Fecha</Label>
          <Button type="button" variant="ghost" size="sm" onClick={handleNow}>
            <Clock className="h-4 w-4" /> Usar ahora
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            id={`${id}-ts`}
            value={timestampInput}
            onChange={(e) => setTimestampInput(e.target.value)}
            placeholder="1735689600"
            inputMode="numeric"
            className="font-mono"
          />
          <Select value={unit} onChange={(e) => setUnit(e.target.value as TimestampUnit)} className="w-40 shrink-0">
            <option value="seconds">Segundos</option>
            <option value="milliseconds">Milisegundos</option>
          </Select>
        </div>

        {tsResult && !tsResult.ok && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{tsResult.error}</p>
        )}
        {tsResult?.ok && (
          <div className="mt-3 space-y-2">
            {[
              { key: "iso", label: "ISO 8601", value: tsResult.iso! },
              { key: "local", label: "Hora local", value: tsResult.local! },
              { key: "utc", label: "UTC", value: tsResult.utc! },
              { key: "relative", label: "Relativo", value: tsResult.relative! },
            ].map(({ key, label, value }) => (
              <div key={key} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="w-24 shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
                <output className="flex-1 break-all font-mono text-sm text-slate-800">{value}</output>
                <Button type="button" variant="outline" size="sm" onClick={() => handleCopy(key, value)} aria-label={`Copiar ${label}`}>
                  {copied === key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-slate-100 pt-6">
        <Label htmlFor={`${id}-date`}>Fecha → Timestamp Unix</Label>
        <Input
          id={`${id}-date`}
          type="datetime-local"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          step={1}
        />
        {dateResult && !dateResult.ok && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{dateResult.error}</p>
        )}
        {dateResult?.ok && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="w-24 shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">Segundos</span>
              <output className="flex-1 break-all font-mono text-sm text-slate-800">{dateResult.seconds}</output>
              <Button type="button" variant="outline" size="sm" onClick={() => handleCopy("s", String(dateResult.seconds))} aria-label="Copiar segundos">
                {copied === "s" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="w-24 shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">Milisegundos</span>
              <output className="flex-1 break-all font-mono text-sm text-slate-800">{dateResult.milliseconds}</output>
              <Button type="button" variant="outline" size="sm" onClick={() => handleCopy("ms", String(dateResult.milliseconds))} aria-label="Copiar milisegundos">
                {copied === "ms" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
