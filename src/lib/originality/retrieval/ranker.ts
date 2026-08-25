import type { SourceCandidate } from "@/lib/originality/retrieval/providers";

/**
 * Ranks retrieved source candidates.
 *
 * Every component stays separate and inspectable rather than collapsing
 * into one opaque number. The hard-won reason: Crossref's own relevance
 * score turned out to be worthless as confidence — a nonsense query
 * scored higher than a real paper — so a provider's ranking is treated as
 * one weak hint among several, never as the answer.
 */

export type SourceConfidence = "high" | "medium" | "low";

export interface SourceRankingSignals {
  /** How well the candidate's text matches the document fragment, 0–1. Computed locally, never taken from the provider. */
  lexicalSimilarity: number;
  /** Cosine similarity when semantic analysis is configured; null means not assessed. */
  semanticSimilarity: number | null;
  /** How complete the bibliographic metadata is, 0–1. */
  metadataCompleteness: number;
  /** True when this source is already cited in the document — strong corroboration that it's the real referent. */
  citedInDocument: boolean;
}

export interface RankedSource {
  candidate: SourceCandidate;
  signals: SourceRankingSignals;
  /** Combined ordering value. For sorting only — never displayed as "how much plagiarism". */
  rankScore: number;
  confidence: SourceConfidence;
  rationale: string;
}

export function metadataCompleteness(c: SourceCandidate): number {
  const fields = [c.doi, c.title, c.url, c.publishedYear, c.authors.length > 0 ? "x" : null];
  return fields.filter(Boolean).length / fields.length;
}

/**
 * Confidence answers "is this really the source", which is a different
 * question from "how similar is the text". Keeping them apart prevents
 * a strong textual match against a badly-identified source from being
 * presented as a confident finding.
 */
export function assessConfidence(signals: SourceRankingSignals): { confidence: SourceConfidence; rationale: string } {
  if (signals.citedInDocument && signals.metadataCompleteness >= 0.6) {
    return {
      confidence: "high",
      rationale: "La fuente aparece citada en el documento y sus metadatos están completos.",
    };
  }

  const strongText = signals.lexicalSimilarity >= 0.6 || (signals.semanticSimilarity ?? 0) >= 0.85;

  if (strongText && signals.metadataCompleteness >= 0.6) {
    return {
      confidence: "high",
      rationale: "Coincidencia de texto fuerte y metadatos suficientes para identificar la fuente.",
    };
  }

  if (strongText || signals.metadataCompleteness >= 0.8) {
    return {
      confidence: "medium",
      rationale: strongText
        ? "El texto coincide con claridad, pero los metadatos de la fuente son incompletos."
        : "La fuente está bien identificada, aunque la coincidencia de texto es moderada.",
    };
  }

  return {
    confidence: "low",
    rationale: "Coincidencia débil o fuente mal identificada; no debería tratarse como evidencia por sí sola.",
  };
}

export function rankSources(
  entries: { candidate: SourceCandidate; signals: SourceRankingSignals }[],
): RankedSource[] {
  return entries
    .map(({ candidate, signals }) => {
      const { confidence, rationale } = assessConfidence(signals);

      // Locally-computed similarity dominates. The provider's own
      // relevance contributes a small tie-breaking nudge at most.
      const semantic = signals.semanticSimilarity ?? 0;
      const providerHint = candidate.providerRelevance === null ? 0 : 0.05;

      const rankScore =
        signals.lexicalSimilarity * 0.5 +
        semantic * 0.25 +
        signals.metadataCompleteness * 0.1 +
        (signals.citedInDocument ? 0.1 : 0) +
        providerHint;

      return { candidate, signals, rankScore, confidence, rationale };
    })
    .sort((a, b) => b.rankScore - a.rankScore);
}
