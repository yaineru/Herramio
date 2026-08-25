export const ENGINE_VERSION = "1.0.0";

export interface ChunkBestMatch {
  type: "exact" | "near_exact" | null;
}

export interface ReportScore {
  similarityIndex: number;
  exactRatio: number;
  nearExactRatio: number;
  /** Always 0 today — no semantic engine is configured; kept as a field so a real one can populate it later without a schema/report-shape change. */
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

  return {
    similarityIndex: (exactCount + nearExactCount) / total,
    exactRatio: exactCount / total,
    nearExactRatio: nearExactCount / total,
    semanticRatio: 0,
  };
}
