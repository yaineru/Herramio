"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { subscribeToNotes, getNotesSnapshot, getNotesServerSnapshot, writeNotes } from "@/lib/productividad/quick-notes-store";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "productividad-notas-rapidas";

export function QuickNotesTool() {
  const [savedFlash, setSavedFlash] = useState(false);

  // Reading via useSyncExternalStore (rather than localStorage directly in
  // an effect) keeps the first client render identical to the
  // server-rendered markup, avoiding a hydration mismatch.
  const text = useSyncExternalStore(subscribeToNotes, getNotesSnapshot, getNotesServerSnapshot);

  function handleChange(value: string) {
    writeNotes(value);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 900);
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  function handleClear() {
    writeNotes("");
    AnalyticsEvents.ctaClicked(`${TOOL_ID}_clear`);
  }

  return (
    <Card className="p-6">
      <Textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        rows={14}
        placeholder="Escribe aquí… se guarda automáticamente en este navegador."
        className="font-mono"
      />

      <div className="mt-4 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          {savedFlash && (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" /> Guardado
            </>
          )}
        </p>
        {text.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
            <Trash2 className="h-3.5 w-3.5" /> Borrar todo
          </Button>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Tus notas se guardan solo en este navegador (localStorage): no se envían a ningún servidor y desaparecen si
        borras los datos del sitio.
      </p>
    </Card>
  );
}
