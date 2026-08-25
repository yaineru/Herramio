import { FileText, Globe, Library } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Identifies where a match came from. Presentational only.
 *
 * Long values (filenames, URLs, DOIs) are the main overflow risk on this
 * screen, so every text node here truncates or breaks rather than
 * stretching its container.
 */

export type SourceOrigin = "internal" | "academic" | "web";

const ORIGIN_META: Record<SourceOrigin, { label: string; Icon: typeof FileText; classes: string }> = {
  internal: { label: "Documento propio", Icon: FileText, classes: "text-slate-700 bg-slate-100 border-slate-300" },
  academic: { label: "Fuente académica", Icon: Library, classes: "text-indigo-800 bg-indigo-50 border-indigo-200" },
  web: { label: "Fuente web", Icon: Globe, classes: "text-slate-700 bg-slate-100 border-slate-300" },
};

export function SourceBadge({
  origin,
  name,
  confidence,
  className,
}: {
  origin: SourceOrigin;
  /** Filename, article title or domain. Truncated visually, full value kept in the tooltip. */
  name?: string | null;
  /** Identification confidence — deliberately distinct from text similarity. */
  confidence?: "high" | "medium" | "low" | null;
  className?: string;
}) {
  const meta = ORIGIN_META[origin];
  const Icon = meta.Icon;

  return (
    <span
      className={cn("inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-lg border px-2 py-1 text-xs", meta.classes, className)}
      title={name ?? meta.label}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">{meta.label}:</span>
      <span className="truncate">{name ?? meta.label}</span>
      {confidence && (
        <span className="shrink-0 border-l border-current/20 pl-1.5 opacity-80">
          {confidence === "high" ? "confianza alta" : confidence === "medium" ? "confianza media" : "confianza baja"}
        </span>
      )}
    </span>
  );
}

/** Monospaced DOI/URL that wraps instead of overflowing — these strings are long and have no spaces. */
export function SourceIdentifier({ value, href }: { value: string; href?: string | null }) {
  const content = <span className="font-mono text-xs break-all text-slate-600">{value}</span>;
  if (!href) return content;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="font-mono text-xs break-all text-emerald-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
    >
      {value}
    </a>
  );
}
