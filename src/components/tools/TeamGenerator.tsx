"use client";

import { useId, useState } from "react";
import { Shuffle, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { splitIntoTeams } from "@/lib/productivity/teams";
import { parseEntries } from "@/lib/productivity/raffle";
import { AnalyticsEvents } from "@/lib/analytics";

const TOOL_ID = "productividad-generador-equipos";

export function TeamGenerator() {
  const id = useId();
  const [input, setInput] = useState("");
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<string[][] | null>(null);

  const entries = parseEntries(input);

  function generate() {
    if (entries.length === 0) return;
    setTeams(splitIntoTeams(entries, teamCount));
    AnalyticsEvents.toolUsed(TOOL_ID);
  }

  function handleClear() {
    setInput("");
    setTeams(null);
  }

  return (
    <Card className="p-6">
      <Label htmlFor={`${id}-input`}>Participantes (uno por línea)</Label>
      <textarea
        id={`${id}-input`}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setTeams(null);
        }}
        placeholder={"Ana\nBeto\nCarla\nDiego\nElena\nFede"}
        rows={8}
        className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />
      <p className="mt-1.5 text-xs text-slate-400">{entries.length} participante{entries.length === 1 ? "" : "s"}</p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor={`${id}-count`}>Número de equipos</Label>
          <input
            id={`${id}-count`}
            type="number"
            min={2}
            max={Math.max(2, entries.length || 2)}
            value={teamCount}
            onChange={(e) => setTeamCount(Math.max(2, Number(e.target.value) || 2))}
            className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <Button type="button" onClick={generate} disabled={entries.length < 2}>
          <Shuffle className="h-4 w-4" /> Generar equipos
        </Button>
        <Button type="button" variant="ghost" onClick={handleClear} disabled={!input}>
          <Trash2 className="h-4 w-4" /> Limpiar
        </Button>
      </div>

      {teams && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {teams.map((team, i) => (
            <div key={i} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-emerald-700">Equipo {i + 1}</p>
              <ul className="space-y-1 text-sm text-slate-800">
                {team.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">
        Los equipos se generan de forma aleatoria y se reparten de la manera más equilibrada
        posible, directamente en tu navegador.
      </p>
    </Card>
  );
}
