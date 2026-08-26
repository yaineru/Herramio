import { describe, expect, it } from "vitest";
import { computeReportScore, strongerMatch, type ChunkBestMatch } from "@/lib/originality/report-score";

/**
 * Scoring rules for the semantic match type, added when the semantic
 * engine was wired into the pipeline.
 */

describe("strongerMatch", () => {
  it("ranks exact above near_exact above semantic", () => {
    expect(strongerMatch("semantic", "near_exact")).toBe("near_exact");
    expect(strongerMatch("near_exact", "exact")).toBe("exact");
    expect(strongerMatch("semantic", "exact")).toBe("exact");
  });

  it("never downgrades an existing match", () => {
    // The semantic stage runs after the lexical one. A chunk already
    // proven to be a verbatim copy must not be relabelled as merely
    // "similar in meaning" just because the semantic pass also fired.
    expect(strongerMatch("exact", "semantic")).toBe("exact");
    expect(strongerMatch("near_exact", "semantic")).toBe("near_exact");
  });

  it("treats null as no match", () => {
    expect(strongerMatch(null, "semantic")).toBe("semantic");
    expect(strongerMatch("semantic", null)).toBe("semantic");
    expect(strongerMatch(null, null)).toBeNull();
  });
});

describe("computeReportScore with semantic matches", () => {
  const score = (types: ChunkBestMatch["type"][]) => computeReportScore(types.map((type) => ({ type })));

  it("reports semantic matches in their own ratio", () => {
    const s = score(["semantic", "semantic", null, null]);
    expect(s.semanticRatio).toBe(0.5);
    expect(s.exactRatio).toBe(0);
    expect(s.nearExactRatio).toBe(0);
  });

  it("counts semantic toward the overall similarity index", () => {
    const s = score(["exact", "near_exact", "semantic", null]);
    expect(s.similarityIndex).toBe(0.75);
    expect(s.exactRatio).toBe(0.25);
    expect(s.nearExactRatio).toBe(0.25);
    expect(s.semanticRatio).toBe(0.25);
  });

  it("counts each chunk exactly once, in its strongest category", () => {
    // A chunk cannot be both exact and semantic in the output — the
    // pipeline collapses it to the stronger one before scoring, so the
    // three ratios always sum to the index.
    const s = score(["exact", "semantic", "near_exact"]);
    expect(s.exactRatio + s.nearExactRatio + s.semanticRatio).toBeCloseTo(s.similarityIndex, 10);
  });

  it("stays at zero when no provider produced semantic matches", () => {
    // The lexical-only path, which is what runs with no key configured.
    const s = score(["exact", "near_exact", null]);
    expect(s.semanticRatio).toBe(0);
    expect(s.similarityIndex).toBeCloseTo(2 / 3, 10);
  });

  it("handles an empty document without dividing by zero", () => {
    expect(computeReportScore([])).toEqual({
      similarityIndex: 0,
      exactRatio: 0,
      nearExactRatio: 0,
      semanticRatio: 0,
    });
  });
});
