import { AlertTriangle, Info, ListChecks, ScanEye, ShieldAlert, Sparkles } from "lucide-react";
import type { AiAnalysisJson } from "@/lib/originality/types";
import { cn } from "@/lib/utils";

/**
 * The written reading of a report.
 *
 * Placed after the numbers, never before them, and visibly styled as
 * commentary rather than as a result. That ordering is a product decision,
 * not a layout one: people anchor on whatever they read first, and the
 * measured evidence is what deserves that position. The prose exists to
 * make the evidence legible, so it must never look like the finding.
 *
 * Severity is carried by an icon, a written word and a border — never by
 * colour alone. The report already had one accessibility failure of
 * exactly that kind (status shown only as a coloured dot, which a screen
 * reader announced as "yellow circle"), and repeating it in the most
 * important panel of the flagship feature would be worse.
 */

const SEVERITY = {
  attention: {
    label: "Requiere atención",
    icon: AlertTriangle,
    className: "border-amber-300 bg-amber-50/70",
    iconClassName: "text-amber-700",
  },
  review: {
    label: "Conviene revisar",
    icon: ScanEye,
    className: "border-sky-300 bg-sky-50/70",
    iconClassName: "text-sky-700",
  },
  info: {
    label: "Contexto",
    icon: Info,
    className: "border-slate-200 bg-slate-50/70",
    iconClassName: "text-slate-600",
  },
} as const;

export function AiExplanationPanel({
  analysis,
  model,
  className,
}: {
  analysis: AiAnalysisJson;
  model: string | null;
  className?: string;
}) {
  return (
    <section
      aria-labelledby="ai-explanation-heading"
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white elevation-1",
        className,
      )}
    >
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-200 bg-slate-50/80 px-5 py-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id="ai-explanation-heading" className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
            Lectura del informe
          </h2>
          <p className="text-xs text-slate-600">
            Interpretación de la evidencia medida arriba. No cambia ninguna cifra.
          </p>
        </div>
        {model && (
          <span className="ml-auto shrink-0 rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {model}
          </span>
        )}
      </header>

      <div className="px-5 py-5">
        {analysis.promptInjectionNoticed && (
          <p className="mb-4 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
            <span>
              <strong className="font-semibold">El documento contenía instrucciones dirigidas al analizador.</strong>{" "}
              No se ejecutaron. Se señala porque un documento que intenta manipular el análisis es en sí mismo algo
              que conviene revisar.
            </span>
          </p>
        )}

        <p className="text-[15px] leading-relaxed text-slate-800">{analysis.summary}</p>

        {analysis.findings.length > 0 && (
          <ul className="mt-5 space-y-2.5">
            {analysis.findings.map((finding, i) => {
              const severity = SEVERITY[finding.severity] ?? SEVERITY.info;
              const Icon = severity.icon;
              return (
                <li key={i} className={cn("rounded-xl border px-3.5 py-3", severity.className)}>
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                    <Icon className={cn("h-4 w-4 shrink-0", severity.iconClassName)} aria-hidden="true" />
                    {finding.title}
                    {/* The severity word matters: the colour alone is not
                        available to everyone reading this. */}
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {severity.label}
                    </span>
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{finding.detail}</p>
                </li>
              );
            })}
          </ul>
        )}

        {analysis.recommendations.length > 0 && (
          <div className="mt-5">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              <ListChecks className="h-4 w-4" aria-hidden="true" />
              Qué hacer ahora
            </h3>
            <ul className="mt-2.5 space-y-1.5">
              {analysis.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-slate-700">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Deliberately the last thing on the panel and deliberately not
            hidden behind a toggle. The limits of the analysis are part of
            the analysis. */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            Lo que este análisis no puede determinar
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{analysis.uncertainty}</p>
        </div>
      </div>
    </section>
  );
}
