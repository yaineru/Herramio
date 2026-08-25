"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AnalyticsEvents } from "@/lib/analytics";
import { classifyMatch, CLASSIFICATION_LABELS } from "@/lib/originality/evidence";
import { cn } from "@/lib/utils";
import type { OriginalityChunk, OriginalityCitation, OriginalitySimilarityMatch } from "@/lib/originality/types";

export function MatchesList({
  documentId,
  chunks,
  matches,
  citations,
}: {
  documentId: string;
  chunks: OriginalityChunk[];
  matches: OriginalitySimilarityMatch[];
  citations: OriginalityCitation[];
}) {
  const [expandedChunkId, setExpandedChunkId] = useState<number | null>(null);
  const matchesByChunk = new Map<number, OriginalitySimilarityMatch[]>();
  for (const match of matches) {
    const list = matchesByChunk.get(match.chunkId) ?? [];
    list.push(match);
    matchesByChunk.set(match.chunkId, list);
  }
  // A chunk that also contains a detected citation is a very different
  // situation from an unattributed match — the text is expected to
  // resemble its source, that's what a citation is for. Never lump the
  // two together under the same "requires review" framing.
  const citedChunkIds = new Set(citations.map((c) => c.chunkId).filter((id): id is number => id !== null));

  const chunksWithMatches = chunks.filter((c) => matchesByChunk.has(c.id));

  if (chunksWithMatches.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No se encontraron coincidencias en el corpus disponible (tus otros documentos y los de tu equipo, si
        aplica).
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {chunksWithMatches.map((chunk) => {
        const chunkMatches = matchesByChunk.get(chunk.id) ?? [];
        const isExpanded = expandedChunkId === chunk.id;
        const bestScore = Math.max(...chunkMatches.map((m) => m.similarityScore));
        const isAttributed = citedChunkIds.has(chunk.id);

        return (
          <li
            key={chunk.id}
            className={cn(
              "overflow-hidden rounded-xl border",
              isAttributed ? "border-slate-200 bg-slate-50" : "border-amber-200 bg-amber-50/40",
            )}
          >
            <button
              type="button"
              onClick={() => {
                const next = isExpanded ? null : chunk.id;
                setExpandedChunkId(next);
                if (next !== null) chunkMatches.forEach((m) => AnalyticsEvents.sourceClicked(documentId, m.id));
              }}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <span className="text-sm text-slate-700">{chunk.text.slice(0, 140)}{chunk.text.length > 140 ? "…" : ""}</span>
              <span className="flex shrink-0 items-center gap-2">
                {isAttributed && (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    Atribuida
                  </span>
                )}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    isAttributed ? "bg-slate-200 text-slate-600" : "bg-amber-100 text-amber-800",
                  )}
                >
                  {Math.round(bestScore * 100)}%
                </span>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </span>
            </button>

            {isExpanded && (
              <div className="space-y-2 border-t border-amber-200 bg-white px-4 py-3">
                {isAttributed && (
                  <p className="text-xs text-slate-500">
                    Este fragmento contiene una cita — la coincidencia probablemente corresponde al texto citado, no
                    a una copia sin atribuir.
                  </p>
                )}
                {chunkMatches.map((match) => {
                  // Classification and wording come from the shared
                  // evidence model, so the report can always explain WHY a
                  // match got its label — and so the "a quote is not a
                  // copy" rule lives in one tested place, not in JSX.
                  const classified = classifyMatch({
                    lexicalScore: match.similarityScore,
                    semanticScore: null,
                    isCited: isAttributed,
                    sourceConfidence: match.matchedDocumentId ? "certain" : "medium",
                  });
                  return (
                    <div key={match.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                      <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                        <span
                          className={cn(
                            "font-semibold",
                            classified.classification === "attributed_quote"
                              ? "text-slate-600"
                              : classified.classification === "exact_copy"
                                ? "text-red-600"
                                : "text-amber-700",
                          )}
                        >
                          {CLASSIFICATION_LABELS[classified.classification]} (
                          {Math.round(match.similarityScore * 100)}%)
                        </span>
                        {match.matchedDocumentFilename && (
                          <span className="shrink-0 text-slate-500">Fuente: {match.matchedDocumentFilename}</span>
                        )}
                      </div>
                      <p className="mb-2 text-xs text-slate-500">{classified.explanation}</p>
                      <p className="text-slate-600">{match.matchedText.slice(0, 200)}{match.matchedText.length > 200 ? "…" : ""}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
