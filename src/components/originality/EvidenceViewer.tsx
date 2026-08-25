"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnalyticsEvents } from "@/lib/analytics";
import { classifyMatch, CLASSIFICATION_LABELS } from "@/lib/originality/evidence";
import { severityForRatio } from "@/lib/originality/ui/severity";
import { SourceBadge } from "@/components/originality/SourceBadge";
import { cn } from "@/lib/utils";
import type { OriginalityChunk, OriginalityCitation, OriginalitySimilarityMatch } from "@/lib/originality/types";

type FilterId = "all" | "uncited" | "exact";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "uncited", label: "Sin citar" },
  { id: "exact", label: "Texto duplicado exacto" },
];

interface EvidenceViewerProps {
  documentId: string;
  chunks: OriginalityChunk[];
  matches: OriginalitySimilarityMatch[];
  citations: OriginalityCitation[];
}

/**
 * Side-by-side evidence explorer: the user's passage on one side, the
 * matched source passage on the other.
 *
 * Layout: stacks vertically on mobile (a two-column diff is unreadable
 * on a narrow screen) and splits at `md`. Every text panel is its own
 * scroll/wrap container so a long passage or an unbroken URL can never
 * widen the page.
 */
export function EvidenceViewer({ documentId, chunks, matches, citations }: EvidenceViewerProps) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  const citedChunkIds = useMemo(
    () => new Set(citations.map((c) => c.chunkId).filter((id): id is number => id !== null)),
    [citations],
  );

  const groups = useMemo(() => {
    const byChunk = new Map<number, OriginalitySimilarityMatch[]>();
    for (const m of matches) {
      const list = byChunk.get(m.chunkId) ?? [];
      list.push(m);
      byChunk.set(m.chunkId, list);
    }

    return chunks
      .filter((c) => byChunk.has(c.id))
      .map((chunk) => {
        const chunkMatches = (byChunk.get(chunk.id) ?? []).sort((a, b) => b.similarityScore - a.similarityScore);
        return {
          chunk,
          matches: chunkMatches,
          isCited: citedChunkIds.has(chunk.id),
          bestScore: Math.max(...chunkMatches.map((m) => m.similarityScore)),
          hasExact: chunkMatches.some((m) => m.matchType === "exact"),
        };
      })
      .sort((a, b) => b.bestScore - a.bestScore);
  }, [chunks, matches, citedChunkIds]);

  const visible = useMemo(() => {
    if (filter === "uncited") return groups.filter((g) => !g.isCited);
    if (filter === "exact") return groups.filter((g) => g.hasExact);
    return groups;
  }, [groups, filter]);

  if (groups.length === 0) {
    return (
      <p className="text-sm text-slate-600">
        No se encontraron coincidencias en el corpus disponible (tus otros documentos y los de tu equipo, si aplica).
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar coincidencias">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          const count =
            f.id === "all" ? groups.length : f.id === "uncited" ? groups.filter((g) => !g.isCited).length : groups.filter((g) => g.hasExact).length;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1",
                active
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              {f.label}
              <span className={cn("tabular-nums", active ? "text-white/70" : "text-slate-500")}>{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          Ninguna coincidencia cumple este filtro.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {visible.map((group) => {
            const severity = severityForRatio(group.bestScore);
            const isOpen = expanded === group.chunk.id;

            return (
              <li
                key={group.chunk.id}
                className={cn(
                  "overflow-hidden rounded-xl border",
                  group.isCited ? "border-slate-200 bg-white" : cn(severity.borderClass, severity.bgClass),
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    const next = isOpen ? null : group.chunk.id;
                    setExpanded(next);
                    if (next !== null) group.matches.forEach((m) => AnalyticsEvents.sourceClicked(documentId, m.id));
                  }}
                  aria-expanded={isOpen}
                  className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-slate-800">{group.chunk.text}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-2">
                      {group.isCited && (
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          Atribuida
                        </span>
                      )}
                      <span className={cn("text-[11px] font-semibold", group.isCited ? "text-slate-600" : severity.textClass)}>
                        {Math.round(group.bestScore * 100)}% · {group.matches.length}{" "}
                        {group.matches.length === 1 ? "fuente" : "fuentes"}
                      </span>
                    </span>
                  </span>
                  <ChevronDown
                    className={cn("mt-0.5 h-4 w-4 shrink-0 text-slate-500 transition-transform motion-reduce:transition-none", isOpen && "rotate-180")}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-slate-200 bg-white p-4">
                    {group.isCited && (
                      <p className="mb-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                        Este fragmento contiene una cita. La coincidencia probablemente corresponde al texto citado, no
                        a una copia sin atribuir.
                      </p>
                    )}

                    <ul className="space-y-4">
                      {group.matches.map((match) => {
                        const classified = classifyMatch({
                          lexicalScore: match.similarityScore,
                          semanticScore: null,
                          isCited: group.isCited,
                          sourceConfidence: match.matchedDocumentId ? "certain" : "medium",
                        });

                        return (
                          <li key={match.id} className="rounded-xl border border-slate-200">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
                              <span className="text-xs font-semibold text-slate-800">
                                {CLASSIFICATION_LABELS[classified.classification]} · {Math.round(match.similarityScore * 100)}%
                              </span>
                              <SourceBadge
                                origin={match.matchedDocumentId ? "internal" : "web"}
                                name={match.matchedDocumentFilename}
                                confidence={match.matchedDocumentId ? "high" : "medium"}
                              />
                            </div>

                            <p className="px-3 pt-3 text-xs text-slate-600">{classified.explanation}</p>

                            <ComparePanes documentText={group.chunk.text} sourceText={match.matchedText} />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * Below `md` the two texts become a tab pair — a two-column diff is
 * unreadable at 375px, and stacking them pushes the source so far down that
 * you lose the comparison. From `md` up both panes show at once and the
 * tabs disappear, so wide screens keep the true side-by-side reading.
 */
function ComparePanes({ documentText, sourceText }: { documentText: string; sourceText: string }) {
  const [tab, setTab] = useState<"document" | "source">("document");
  const tabs = [
    { id: "document" as const, label: "Tu documento" },
    { id: "source" as const, label: "Evidencia" },
  ];

  return (
    <div className="p-3">
      <div className="mb-2 flex gap-1 md:hidden" role="tablist" aria-label="Comparación">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`pane-${t.id}`}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1",
              tab === t.id
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Panel
          id="pane-document"
          labelledBy="tab-document"
          title="Tu documento"
          tone="document"
          text={documentText}
          hiddenOnMobile={tab !== "document"}
        />
        <Panel
          id="pane-source"
          labelledBy="tab-source"
          title="Fuente"
          tone="source"
          text={sourceText}
          hiddenOnMobile={tab !== "source"}
        />
      </div>
    </div>
  );
}

function Panel({
  id,
  labelledBy,
  title,
  tone,
  text,
  hiddenOnMobile,
}: {
  id: string;
  labelledBy: string;
  title: string;
  tone: "document" | "source";
  text: string;
  hiddenOnMobile: boolean;
}) {
  return (
    // `hidden md:block` rather than unmounting: the pane still exists in the
    // DOM at md+, where the tabs are gone and both must always be visible.
    <div id={id} role="tabpanel" aria-labelledby={labelledBy} className={cn("min-w-0", hiddenOnMobile && "hidden md:block")}>
      {/* Redundant on mobile (the tab already says it), so hidden from AT there. */}
      <p className="mb-1.5 hidden text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:block">{title}</p>
      <div
        className={cn(
          "max-h-48 overflow-y-auto overflow-x-hidden rounded-lg border p-3",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1",
          tone === "document" ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50",
        )}
        tabIndex={0}
      >
        {/* break-words: source passages can contain long unbroken URLs. */}
        <p className="text-xs leading-relaxed break-words text-slate-700">{text}</p>
      </div>
    </div>
  );
}
