"use client";

import { useState } from "react";
import { ArrowRight, Plus, Trash2, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { calculateSettlements } from "@/lib/finanzas/group-expenses";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "finanzas-dividir-gastos-grupo";

interface Row {
  name: string;
  paid: string;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function GroupExpenseSplitter() {
  const [rows, setRows] = useState<Row[]>([
    { name: "", paid: "" },
    { name: "", paid: "" },
  ]);

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  function addRow() {
    if (rows.length >= 12) return;
    setRows((prev) => [...prev, { name: "", paid: "" }]);
  }

  function removeRow(index: number) {
    if (rows.length <= 2) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  const filledRows = rows.filter((r) => r.name.trim() !== "" || r.paid.trim() !== "");
  const allFilled = filledRows.length >= 2 && filledRows.every((r) => r.name.trim() !== "" && r.paid.trim() !== "");
  const participants = filledRows.map((r) => ({ name: r.name.trim(), paid: Number(r.paid) }));
  const settlements = allFilled ? calculateSettlements(participants) : null;
  const total = allFilled ? participants.reduce((sum, p) => sum + p.paid, 0) : 0;

  return (
    <Card className="p-6">
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input placeholder={`Persona ${i + 1}`} value={row.name} onChange={(e) => updateRow(i, { name: e.target.value })} className="flex-1" />
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="0.00"
              value={row.paid}
              onChange={(e) => updateRow(i, { paid: e.target.value })}
              className="w-32"
            />
            {rows.length > 2 && (
              <button type="button" onClick={() => removeRow(i)} aria-label="Quitar persona" className="shrink-0 text-slate-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        {rows.length < 12 && (
          <Button type="button" variant="ghost" size="sm" onClick={addRow}>
            <Plus className="h-3.5 w-3.5" /> Añadir persona
          </Button>
        )}
      </div>

      <div className="mt-6">
        {filledRows.length >= 2 && !allFilled && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Completa el nombre y el monto pagado por cada persona.
          </p>
        )}
        {allFilled && settlements === null && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Revisa los nombres (no pueden repetirse ni estar vacíos) y que los montos no sean negativos.
          </p>
        )}
        {settlements && (
          <div>
            <p className="mb-3 text-sm text-slate-500">
              Total del grupo: <span className="font-semibold text-slate-900">{fmt(total)}</span> · Cada persona debería aportar{" "}
              <span className="font-semibold text-slate-900">{fmt(total / participants.length)}</span>
            </p>
            {settlements.length === 0 ? (
              <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <Users className="h-4 w-4 shrink-0" /> Todos aportaron lo mismo — nadie le debe nada a nadie.
              </p>
            ) : (
              <div className="space-y-2">
                {settlements.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                    <span className="font-medium text-slate-900">{s.from}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="font-medium text-slate-900">{s.to}</span>
                    <span className="ml-auto font-semibold text-emerald-700">{fmt(s.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-5 text-xs text-slate-400">
        Calcula el número mínimo de pagos para saldar las cuentas — calculado en tu navegador.
      </p>
    </Card>
  );
}
