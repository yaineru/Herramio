export const ENGINE_VERSION = "1.0.0";

export interface ChunkBestMatch {
  type: "exact" | "near_exact" | "semantic" | null;
}

/**
 * Strength order. A chunk contributes its single strongest match, so a
 * passage that is BOTH a verbatim copy and semantically close counts
 * once, as a copy. Semantic sits lowest deliberately: it is the weakest
 * of the three claims, because sharing meaning is not sharing text.
 */
const MATCH_STRENGTH: Record<Exclude<ChunkBestMatch["type"], null>, number> = {
  exact: 3,
  near_exact: 2,
  semantic: 1,
};

/** Returns the stronger of two match types. */
export function strongerMatch(a: ChunkBestMatch["type"], b: ChunkBestMatch["type"]): ChunkBestMatch["type"] {
  if (a === null) return b;
  if (b === null) return a;
  return MATCH_STRENGTH[a] >= MATCH_STRENGTH[b] ? a : b;
}

export interface ReportScore {
  similarityIndex: number;
  exactRatio: number;
  nearExactRatio: number;
  /**
   * Fraction of chunks whose strongest evidence is semantic — reworded
   * rather than copied. Zero when no provider is configured, which the
   * report states as "no disponible" rather than as 0%.
   */
  semanticRatio: number;
}

/**
 * Transparent, reproducible scoring — never "the model said X%". Each
 * chunk contributes at most once (its single best match, if any), so a
 * chunk that matches three different sources doesn't inflate the index.
 * Citation matches don't count toward the index at all — a correctly
 * attributed quote is not similarity that should concern anyone; see
 * ORIGINALITY.md for why that distinction is load-bearing.
 */
export function computeReportScore(bestMatchPerChunk: ChunkBestMatch[]): ReportScore {
  const total = bestMatchPerChunk.length;
  if (total === 0) {
    return { similarityIndex: 0, exactRatio: 0, nearExactRatio: 0, semanticRatio: 0 };
  }

  const exactCount = bestMatchPerChunk.filter((m) => m.type === "exact").length;
  const nearExactCount = bestMatchPerChunk.filter((m) => m.type === "near_exact").length;
  const semanticCount = bestMatchPerChunk.filter((m) => m.type === "semantic").length;

  return {
    similarityIndex: (exactCount + nearExactCount + semanticCount) / total,
    exactRatio: exactCount / total,
    nearExactRatio: nearExactCount / total,
    semanticRatio: semanticCount / total,
  };
}
