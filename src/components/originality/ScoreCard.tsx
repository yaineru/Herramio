import { severityForRatio } from "@/lib/originality/ui/severity";
import { cn } from "@/lib/utils";

/**
 * Presentational only — receives a ratio, renders a gauge. No data
 * fetching, no business logic, so the visual layer can be changed without
 * any risk to the scoring engine.
 */

interface ScoreCardProps {
  /** 0–1. */
  ratio: number;
  exactRatio: number;
  nearRatio: number;
  semanticAvailable: boolean;
  className?: string;
}

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreCard({ ratio, exactRatio, nearRatio, semanticAvailable, className }: ScoreCardProps) {
  const pct = Math.round(ratio * 100);
  const severity = severityForRatio(ratio);
  const dashOffset = CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, ratio)));

  return (
    <section
      className={cn("rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 p-6 sm:p-8", className)}
      aria-labelledby="score-heading"
    >
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="relative shrink-0 rounded-full border border-slate-200 bg-white p-2 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <svg
            width="128"
            height="128"
            viewBox="0 0 128 128"
            role="img"
            aria-label={`Índice de similitud: ${pct} por ciento. ${severity.label}.`}
            className="-rotate-90"
          >
            <circle cx="64" cy="64" r={RADIUS} className="fill-none stroke-slate-200" strokeWidth="10" />
            <circle
              cx="64"
              cy="64"
              r={RADIUS}
              className={cn("fill-none transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none", severity.strokeClass)}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
            <span className="text-3xl font-bold tabular-nums text-slate-900">{pct}%</span>
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">similitud</span>
          </div>
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h2 id="score-heading" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Índice de similitud
            </h2>
            <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", severity.textClass, severity.bgClass, severity.borderClass)}>
              {severity.label}
            </span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-600">{severity.guidance}</p>

          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Un índice de similitud <strong>no determina por sí solo la existencia de plagio</strong>. Incluye citas
            correctamente atribuidas, frases comunes y coincidencias accidentales. Requiere interpretación humana.
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Metric label="Coincidencia exacta" value={`${Math.round(exactRatio * 100)}%`} />
            <Metric label="Coincidencia cercana" value={`${Math.round(nearRatio * 100)}%`} />
            <Metric
              label="Similitud semántica"
              value={semanticAvailable ? "—" : "No disponible"}
              muted={!semanticAvailable}
            />
          </dl>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <dt className="text-[11px] leading-tight text-slate-500">{label}</dt>
      <dd className={cn("mt-1 text-sm font-semibold tabular-nums", muted ? "text-slate-500" : "text-slate-900")}>
        {value}
      </dd>
    </div>
  );
}
