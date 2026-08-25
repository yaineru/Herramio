import { describe, it, expect } from "vitest";
import { computeReportScore } from "@/lib/originality/report-score";

describe("computeReportScore", () => {
  it("is all zeros for a document with no chunks", () => {
    expect(computeReportScore([])).toEqual({ similarityIndex: 0, exactRatio: 0, nearExactRatio: 0, semanticRatio: 0 });
  });

  it("is all zeros when nothing matched", () => {
    const result = computeReportScore([{ type: null }, { type: null }, { type: null }]);
    expect(result.similarityIndex).toBe(0);
  });

  it("counts exact and near_exact matches toward the similarity index equally", () => {
    const result = computeReportScore([{ type: "exact" }, { type: "near_exact" }, { type: null }, { type: null }]);
    expect(result.similarityIndex).toBe(0.5);
    expect(result.exactRatio).toBe(0.25);
    expect(result.nearExactRatio).toBe(0.25);
  });

  it("is 1 when every chunk matched", () => {
    const result = computeReportScore([{ type: "exact" }, { type: "exact" }]);
    expect(result.similarityIndex).toBe(1);
  });

  it("always reports semanticRatio as 0 — no semantic engine is configured", () => {
    const result = computeReportScore([{ type: "exact" }]);
    expect(result.semanticRatio).toBe(0);
  });
});
