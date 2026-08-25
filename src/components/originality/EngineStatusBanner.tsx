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
      className={cn("rounded-2xl border border-slate-200 bg-white p-5", className)}
      aria-labelledby="engines-heading"
    >
      <h2 id="engines-heading" className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Motores de análisis
      </h2>

      <ul className="mt-3 flex flex-wrap gap-2">
        {engines.map((engine) => {
          const p = enginePresentation(engine.state, engine.name);
          return (
            <li key={engine.name}>
              <span
                className={cn(
                  "inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
                  p.textClass,
                  p.bgClass,
                  p.borderClass,
                )}
              >
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", p.dotClass)} aria-hidden="true" />
                <span className="truncate">{engine.name}</span>
                <span className="shrink-0 opacity-70">·</span>
                <span className="shrink-0">{engine.detail}</span>
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
