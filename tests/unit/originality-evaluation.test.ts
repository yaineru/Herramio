import { describe, it, expect } from "vitest";
import { compareChunks } from "@/lib/originality/similarity";
import { normalizeText } from "@/lib/originality/normalize";
import { GOLDEN_CASES, SOURCE_TEXT } from "@/lib/originality/evaluation/dataset";
import {
  classifyOutcome,
  computeMetrics,
  computeMetricsByKind,
  formatMetrics,
  type EvaluatedCase,
} from "@/lib/originality/evaluation/metrics";

function runEngine() {
  const source = normalizeText(SOURCE_TEXT);
  return GOLDEN_CASES.map<EvaluatedCase & { kind: string; semanticOnly: boolean }>((c) => {
    const actual = compareChunks(source, normalizeText(c.text)).type !== null;
    return {
      id: c.id,
      kind: c.kind,
      semanticOnly: c.semanticOnly === true,
      expected: c.shouldMatch,
      actual,
      outcome: classifyOutcome(c.shouldMatch, actual),
    };
  });
}

describe("originality engine evaluation (golden dataset)", () => {
  const results = runEngine();
  const metrics = computeMetrics(results);

  it("reports its measured metrics", () => {
    // Printed so the real numbers are visible in test output rather than
    // living only in a doc that can drift from the code.
    console.log(`\n  Lexical engine — ${formatMetrics(metrics)}\n`);
    expect(metrics.total).toBe(GOLDEN_CASES.length);
  });

  it("produces ZERO false positives — the failure mode that wrongly accuses a real person", () => {
    const fps = results.filter((r) => r.outcome === "FP");
    expect(fps.map((f) => f.id)).toEqual([]);
    expect(metrics.precision).toBe(1);
  });

  it("catches every copy-derived case (recall = 100% on non-semantic cases)", () => {
    const lexicalCases = results.filter((r) => !r.semanticOnly);
    const missed = lexicalCases.filter((r) => r.outcome === "FN");
    expect(missed.map((m) => `${m.id} (${m.kind})`)).toEqual([]);
  });

  it("documents the paraphrase limitation as a measured fact, not a claim", () => {
    // The only expected miss. If a future semantic engine starts catching
    // this, THIS test failing is the signal to update the product's
    // claims — it must never silently start/stop working.
    const paraphrase = results.find((r) => r.id === "paraphrase");
    expect(paraphrase?.semanticOnly).toBe(true);
    expect(paraphrase?.actual).toBe(false);
  });

  it("REGRESSION GATE: precision stays at 1.0 and recall on lexical cases stays at 1.0", () => {
    const lexicalOnly = results.filter((r) => !r.semanticOnly);
    const lexicalMetrics = computeMetrics(lexicalOnly);
    expect(lexicalMetrics.precision).toBe(1);
    expect(lexicalMetrics.recall).toBe(1);
    expect(lexicalMetrics.f1).toBe(1);
  });

  it("keeps the confusion matrix and sample counts explicit for the protected baseline", () => {
    expect(metrics.truePositives).toBeGreaterThan(0);
    expect(metrics.falsePositives).toBe(0);
    expect(metrics.trueNegatives).toBeGreaterThan(0);
    expect(metrics.falseNegatives).toBe(0);
    expect(metrics.positiveSamples).toBeGreaterThan(0);
    expect(metrics.negativeSamples).toBeGreaterThan(0);
    expect(metrics.total).toBe(GOLDEN_CASES.length);
  });

  it("reports metrics by class to surface the failure mode before a broader rollout", () => {
    const byKind = computeMetricsByKind(results);
    expect(Object.keys(byKind).length).toBeGreaterThan(0);
    expect(byKind.exact_copy).toBeDefined();
    expect(byKind.common_heading).toBeDefined();
  });
});
