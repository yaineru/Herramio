"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { DiffToken } from "@/lib/pdf/pdf-diff";

/**
 * Presentational diff renderer. Receives already-computed tokens — it never
 * reads files, parses PDFs or calls the diff engine itself, so the view can
 * change without touching the comparison logic.
 *
 * Accessibility rule enforced here: a change is never signalled by colour
 * alone. Every added/removed run also carries a typographic cue (underline /
 * strike-through) plus an off-screen word for screen readers.
 */

type ViewMode = "unified" | "split";

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: "unified", label: "Vista unificada" },
  { id: "split", label: "Lado a lado" },
];

export function TextDiffView({ tokens }: { tokens: DiffToken[] }) {
  const [mode, setMode] = useState<ViewMode>("unified");

  const addedCount = tokens.filter((t) => t.type === "added" && t.value.trim() !== "").length;
  const removedCount = tokens.filter((t) => t.type === "removed" && t.value.trim() !== "").length;

  return (
    <section aria-labelledby="diff-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="diff-heading" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Diferencias
        </h3>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Modo de visualización">
          {VIEW_MODES.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setMode(v.id)}
              aria-pressed={mode === v.id}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1",
                mode === v.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* The counts are the summary a screen-reader user gets instead of scanning colours. */}
      <p className="mt-2 text-xs text-slate-600">
        <span className="font-semibold tabular-nums">{addedCount}</span> palabras añadidas en el documento B ·{" "}
        <span className="font-semibold tabular-nums">{removedCount}</span> palabras eliminadas respecto al documento A.
      </p>

      <Legend />

      {mode === "unified" ? (
        <DiffPane className="mt-3" ariaLabel="Diferencias, vista unificada">
          {tokens.map((token, i) => (
            <DiffRun key={i} token={token} />
          ))}
        </DiffPane>
      ) : (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="min-w-0">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Documento A</p>
            <DiffPane ariaLabel="Documento A, con lo eliminado marcado">
              {tokens
                .filter((t) => t.type !== "added")
                .map((token, i) => (
                  <DiffRun key={i} token={token} />
                ))}
            </DiffPane>
          </div>
          <div className="min-w-0">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Documento B</p>
            <DiffPane ariaLabel="Documento B, con lo añadido marcado">
              {tokens
                .filter((t) => t.type !== "removed")
                .map((token, i) => (
                  <DiffRun key={i} token={token} />
                ))}
            </DiffPane>
          </div>
        </div>
      )}
    </section>
  );
}

function Legend() {
  return (
    <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
      <li className="flex items-center gap-1.5">
        <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-medium text-emerald-900 underline decoration-emerald-700 decoration-2">
          añadido
        </span>
        <span>solo está en B</span>
      </li>
      <li className="flex items-center gap-1.5">
        <span className="rounded bg-rose-100 px-1.5 py-0.5 font-medium text-rose-900 line-through decoration-rose-700 decoration-2">
          eliminado
        </span>
        <span>solo está en A</span>
      </li>
    </ul>
  );
}

/**
 * `break-words` matters here: extracted PDF text regularly contains long
 * unbroken strings (URLs, reference numbers) that would otherwise force the
 * whole page to scroll sideways.
 */
function DiffPane({ children, ariaLabel, className }: { children: React.ReactNode; ariaLabel: string; className?: string }) {
  return (
    <div
      className={cn(
        "max-h-96 overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-slate-50 px-4 py-3",
        "text-sm leading-relaxed break-words whitespace-pre-wrap text-slate-800",
        // The pane is tabbable (it scrolls), so it needs its own visible focus ring.
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2",
        className,
      )}
      tabIndex={0}
      role="region"
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}

function DiffRun({ token }: { token: DiffToken }) {
  if (token.type === "equal") return <span>{token.value}</span>;

  const isAdded = token.type === "added";
  // Whitespace-only runs get the background but no announcement — reading
  // "añadido: (space)" for every gap would make the output unusable.
  const announce = token.value.trim() !== "";

  return (
    <span
      className={cn(
        "rounded",
        isAdded
          ? "bg-emerald-100 text-emerald-900 underline decoration-emerald-700 decoration-2"
          : "bg-rose-100 text-rose-900 line-through decoration-rose-700 decoration-2",
      )}
    >
      {announce && <span className="sr-only">{isAdded ? " añadido: " : " eliminado: "}</span>}
      {token.value}
      {announce && <span className="sr-only"> fin. </span>}
    </span>
  );
}
