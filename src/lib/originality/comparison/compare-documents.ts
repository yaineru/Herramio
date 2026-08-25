import { chunkText } from "@/lib/originality/chunk";
import { compareChunks } from "@/lib/originality/similarity";
import { evaluateHybridEvidence, type HybridEvidenceDecision } from "@/lib/originality/evidence";

/**
 * Direct A-vs-B document comparison.
 *
 * Deliberately NOT a second engine: it drives the same chunker, the same
 * lexical/near matcher and the same hybrid evidence model the main
 * originality pipeline uses, so a change to matching behaviour can never
 * silently apply to one path and not the other.
 *
 * Pure and synchronous — no database, no storage, no network. Text
 * extraction happens upstream (the caller passes already-extracted text),
 * which keeps this testable without fixtures and reusable for both
 * "compare two uploads" and "compare against a repository document".
 */

export type ComparisonSemanticState = "semantic_unavailable" | "semantic_available";

export interface ChunkPairMatch {
  /** 0-based chunk index within document A. */
  aSequence: number;
  /** 0-based chunk index within document B. */
  bSequence: number;
  aText: string;
  bText: string;
  matchType: "exact" | "near_exact";
  lexicalScore: number;
  semanticScore: number | null;
  decision: HybridEvidenceDecision;
}

export interface DocumentComparisonResult {
  /** Share of A's chunks that matched something in B, 0–1. Direction matters: see `coverageOfB`. */
  coverageOfA: number;
  /** Share of B's chunks that matched something in A, 0–1. */
  coverageOfB: number;
  /**
   * Headline figure: the higher of the two coverages. Using the max (not
   * an average) means a short document copied wholesale into a long one
   * still reports high — averaging would dilute exactly the case that
   * matters most.
   */
  overallSimilarity: number;
  exactMatchCount: number;
  nearMatchCount: number;
  semanticMatchCount: number;
  matches: ChunkPairMatch[];
  aChunkCount: number;
  bChunkCount: number;
  semanticState: ComparisonSemanticState;
  /** Present only when semantic analysis was unavailable — surfaced verbatim in the UI, never hidden. */
  semanticNotice: string | null;
  engineVersion: string;
}

export const COMPARISON_ENGINE_VERSION = "1.0.0";

const SEMANTIC_UNAVAILABLE_NOTICE =
  "El análisis semántico no está configurado. Esta comparación se basa únicamente en coincidencias de texto: " +
  "una reescritura con otras palabras no aparecería aquí.";

/** Optional hook so the caller can supply semantic scores when a provider exists. Returning null means "not assessed". */
export type SemanticScorer = (aNormalized: string, bNormalized: string) => number | null;

export interface CompareDocumentsOptions {
  /** Supply only when a real embedding provider is configured. Absent → the result honestly reports semantic analysis as unavailable. */
  semanticScorer?: SemanticScorer;
}

export function compareDocuments(
  textA: string,
  textB: string,
  options: CompareDocumentsOptions = {},
): DocumentComparisonResult {
  const chunksA = chunkText(textA);
  const chunksB = chunkText(textB);
  const semanticAvailable = typeof options.semanticScorer === "function";

  const matches: ChunkPairMatch[] = [];
  const matchedA = new Set<number>();
  const matchedB = new Set<number>();

  for (const a of chunksA) {
    for (const b of chunksB) {
      const lexical = compareChunks(a.normalizedText, b.normalizedText);
      const semanticScore = options.semanticScorer
        ? options.semanticScorer(a.normalizedText, b.normalizedText)
        : null;

      // A pair is worth reporting when EITHER signal says so. Without a
      // semantic scorer this reduces to pure lexical behaviour, which is
      // exactly the current production path.
      const lexicalMatched = lexical.type !== null;
      const semanticMatched = semanticScore !== null && semanticScore >= 0.75;
      if (!lexicalMatched && !semanticMatched) continue;

      const decision = evaluateHybridEvidence({
        lexicalScore: lexical.score,
        semanticScore,
        // Citation context belongs to the single-document pipeline (it
        // knows where citations sit); a raw A-vs-B comparison has no such
        // context, so it must not claim attribution either way.
        isCited: false,
        sourceConfidence: "certain",
      });

      matches.push({
        aSequence: a.sequence,
        bSequence: b.sequence,
        aText: a.text,
        bText: b.text,
        matchType: lexical.type ?? "near_exact",
        lexicalScore: lexical.score,
        semanticScore,
        decision,
      });
      matchedA.add(a.sequence);
      matchedB.add(b.sequence);
    }
  }

  const coverageOfA = chunksA.length === 0 ? 0 : matchedA.size / chunksA.length;
  const coverageOfB = chunksB.length === 0 ? 0 : matchedB.size / chunksB.length;

  matches.sort((x, y) => y.lexicalScore - x.lexicalScore);

  return {
    coverageOfA,
    coverageOfB,
    overallSimilarity: Math.max(coverageOfA, coverageOfB),
    exactMatchCount: matches.filter((m) => m.matchType === "exact").length,
    nearMatchCount: matches.filter((m) => m.matchType === "near_exact").length,
    semanticMatchCount: matches.filter((m) => m.decision.mode === "semantic" || m.decision.mode === "hybrid").length,
    matches,
    aChunkCount: chunksA.length,
    bChunkCount: chunksB.length,
    semanticState: semanticAvailable ? "semantic_available" : "semantic_unavailable",
    semanticNotice: semanticAvailable ? null : SEMANTIC_UNAVAILABLE_NOTICE,
    engineVersion: COMPARISON_ENGINE_VERSION,
  };
}
