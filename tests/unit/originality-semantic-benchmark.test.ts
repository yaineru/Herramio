import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEMANTIC_MATCH_THRESHOLD } from "@/lib/originality/semantic/engine";
import { GOLDEN_CASES, expectedSemanticMatch } from "@/lib/originality/evaluation/dataset";

/**
 * Guards the measured semantic benchmark.
 *
 * The numbers come from scripts/semantic-benchmark.mjs, which embeds the
 * golden dataset with real OpenAI vectors. That script costs money and
 * needs network, so it is not a test; this reads what it recorded and
 * asserts the conclusions still hold. Re-run the script after changing
 * the dataset, the model or the threshold, and this will tell you if a
 * conclusion moved.
 */

const benchmark = JSON.parse(
  readFileSync(join(process.cwd(), "tests/fixtures/semantic-benchmark.json"), "utf8"),
) as {
  model: string;
  dimensions: number;
  cases: number;
  semanticThreshold: number;
  semanticPlateau: [number, number];
  strategies: Record<string, { precision: number; recall: number; f1: number; fp: number; fn: number; falseNegatives: string[] }>;
  perCase: { id: string; expectedSemantic: boolean; lexical: number; semantic: number }[];
  usage: { apiTokens: number; estimatedCostUsd: number };
};

describe("semantic benchmark (real OpenAI embeddings)", () => {
  it("was measured against the model the vector column is built for", () => {
    expect(benchmark.model).toBe("text-embedding-3-small");
    expect(benchmark.dimensions).toBe(1536);
    expect(benchmark.cases).toBe(GOLDEN_CASES.length);
  });

  it("ships the threshold the sweep actually chose", () => {
    expect(SEMANTIC_MATCH_THRESHOLD).toBe(benchmark.semanticThreshold);
    const [low, high] = benchmark.semanticPlateau;
    expect(SEMANTIC_MATCH_THRESHOLD).toBeGreaterThanOrEqual(low);
    expect(SEMANTIC_MATCH_THRESHOLD).toBeLessThanOrEqual(high);
  });

  it("keeps precision at 1.0 for every strategy — no one gets wrongly accused", () => {
    for (const [name, m] of Object.entries(benchmark.strategies)) {
      expect(m.precision, `${name} precision`).toBe(1);
      expect(m.fp, `${name} false positives`).toBe(0);
    }
  });

  it("shows hybrid beating lexical alone on the derivation question", () => {
    // This is the entire justification for paying for embeddings. If the
    // gap ever closes, the semantic layer is no longer earning its cost.
    const lexicalOnly = benchmark.strategies["lexical (semantic q.)"];
    const hybrid = benchmark.strategies.hybrid;
    expect(hybrid.recall).toBeGreaterThan(lexicalOnly.recall);
    expect(hybrid.f1).toBeGreaterThan(lexicalOnly.f1);
    expect(hybrid.recall).toBe(1);
  });

  it("catches every paraphrase the lexical engine cannot see", () => {
    const paraphrases = GOLDEN_CASES.filter((c) => c.semanticOnly === true).map((c) => c.id);
    expect(paraphrases.length).toBeGreaterThanOrEqual(5);

    for (const id of paraphrases) {
      const row = benchmark.perCase.find((r) => r.id === id);
      expect(row, id).toBeDefined();
      // Invisible to lexical by construction...
      expect(row!.lexical, `${id} lexical`).toBeLessThan(0.25);
      // ...and reachable by semantic, which is the point.
      expect(row!.semantic, `${id} semantic`).toBeGreaterThanOrEqual(SEMANTIC_MATCH_THRESHOLD);
    }
  });

  it("keeps independently-written text below the bar", () => {
    // The failure mode that matters: text about the same topic, written
    // by someone who never saw the source, must not score as derived.
    const independent = benchmark.perCase.filter((r) => !r.expectedSemantic);
    expect(independent.length).toBeGreaterThan(5);
    for (const row of independent) {
      expect(row.semantic, `${row.id} must stay below the threshold`).toBeLessThan(SEMANTIC_MATCH_THRESHOLD);
    }
  });

  it("records the one case semantic gives up, and why lexical covers it", () => {
    // Documented rather than hidden: a single sentence copied into a long
    // original is diluted in a whole-chunk embedding. Lexical containment
    // is what rescues it, which is why both engines run.
    expect(benchmark.strategies.semantic.falseNegatives).toEqual(["fragment_in_unique_text"]);
    const row = benchmark.perCase.find((r) => r.id === "fragment_in_unique_text")!;
    expect(row.semantic).toBeLessThan(SEMANTIC_MATCH_THRESHOLD);
    expect(row.lexical).toBeGreaterThanOrEqual(0.25);
  });

  it("agrees with the dataset about which cases are derived", () => {
    for (const c of GOLDEN_CASES) {
      const row = benchmark.perCase.find((r) => r.id === c.id);
      expect(row, c.id).toBeDefined();
      expect(row!.expectedSemantic, c.id).toBe(expectedSemanticMatch(c));
    }
  });

  it("cost a negligible amount to produce", () => {
    expect(benchmark.usage.apiTokens).toBeGreaterThan(0);
    expect(benchmark.usage.estimatedCostUsd).toBeLessThan(0.01);
  });
});
