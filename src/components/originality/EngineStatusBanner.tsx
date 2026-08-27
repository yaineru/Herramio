import { enginePresentation, type EngineState } from "@/lib/originality/ui/severity";
import { cn } from "@/lib/utils";

/**
 * States which analysis engines actually ran. Presentational only.
 *
 * The product rule this enforces visually: a capability that isn't
 * configured is shown as a neutral, informational state — never as an
 * error, and never hidden. Hiding it would let a reader assume the
 * document was checked against sources it never touched.
 */

export interface EngineStatus {
  name: string;
  state: EngineState;
  detail: string;
}

export function EngineStatusBanner({ engines, className }: { engines: EngineStatus[]; className?: string }) {
  return (
    <section
      className={cn("rounded-2xl border border-slate-200 bg-white p-5 elevation-1", className)}
      aria-labelledby="engines-heading"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="engines-heading" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Motores de análisis
        </h2>
      </div>

      <ul className="mt-4 grid gap-3 md:grid-cols-3">
        {engines.map((engine) => {
          const p = enginePresentation(engine.state, engine.name);
          return (
            <li key={engine.name} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", p.dotClass)} aria-hidden="true" />
                <span className="text-sm font-semibold text-slate-800">{engine.name}</span>
              </div>
              <span
                className={cn(
                  "mt-3 inline-flex w-full items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                  p.textClass,
                  p.bgClass,
                  p.borderClass,
                )}
              >
                {engine.detail}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * Explains, in plain language, that external repository search is off —
 * framed as a deliberate operating mode rather than a fault, because that
 * is what it is.
 */
export function ExternalSearchNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-xl border border-slate-200 bg-slate-50 p-4", className)}
      role="note"
    >
      <p className="text-sm font-medium text-slate-800">Búsqueda en repositorios externos en pausa</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">
        Este análisis se ejecutó con el motor local determinista. Se comparó contra tus documentos anteriores
        {" "}(y los de tu equipo, si aplica) y se verificaron las referencias en Crossref. No se consultaron
        buscadores web ni bases académicas adicionales.
      </p>
    </div>
  );
}
