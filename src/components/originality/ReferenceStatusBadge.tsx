import { cn } from "@/lib/utils";
import type { ReferenceVerificationStatus } from "@/lib/originality/types";

/**
 * Verification state of one bibliography entry.
 *
 * Replaces a bare 🟢/🟡/⚪ emoji. Three problems with the emoji version,
 * all found by auditing the real report:
 *
 *  - the state was carried by colour alone, which is the one thing this
 *    product's design rules forbid;
 *  - a screen reader announced "yellow circle", which tells the reader
 *    nothing about their bibliography;
 *  - the surrounding text colour measured 2.13:1, below the AA floor.
 *
 * The wording is load-bearing too. "not_found" is never rendered as
 * "false" or "invalid": Crossref indexes journal articles well and books,
 * theses and grey literature poorly, so absence there is weak evidence of
 * nothing. The label says what actually happened — we looked and did not
 * find it — and the description says what that does not mean.
 */

const STATUS_META: Record<
  ReferenceVerificationStatus,
  { label: string; description: string; classes: string; dot: string }
> = {
  verified: {
    label: "Verificada",
    description: "Encontramos un trabajo indexado en Crossref que coincide con esta referencia.",
    classes: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-600",
  },
  not_found: {
    label: "No encontrada",
    description:
      "No hallamos coincidencia en Crossref. Esto no significa que la referencia sea falsa: muchos libros, tesis y publicaciones reales no están indexados ahí.",
    classes: "border-amber-200 bg-amber-50 text-amber-900",
    dot: "bg-amber-600",
  },
  unverified: {
    label: "Sin verificar",
    description: "Todavía no se comprobó esta referencia.",
    classes: "border-slate-300 bg-slate-100 text-slate-700",
    dot: "bg-slate-500",
  },
};

export function ReferenceStatusBadge({
  status,
  className,
}: {
  status: ReferenceVerificationStatus;
  className?: string;
}) {
  const meta = STATUS_META[status] ?? STATUS_META.unverified;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        meta.classes,
        className,
      )}
      title={meta.description}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", meta.dot)} aria-hidden="true" />
      {meta.label}
      {/* The colour and the short label say "what"; this says "what it
          means", and only a screen reader needs it spelled out inline. */}
      <span className="sr-only">. {meta.description}</span>
    </span>
  );
}

export function ReferenceStatusLegend() {
  return (
    <p className="mt-3 text-xs leading-relaxed text-slate-500">
      <strong className="font-medium text-slate-700">Verificada</strong>: encontrada en Crossref, un índice académico
      gratuito y abierto. <strong className="font-medium text-slate-700">No encontrada</strong>: no aparece ahí — no
      significa que sea falsa, muchas fuentes reales no están indexadas.
    </p>
  );
}
