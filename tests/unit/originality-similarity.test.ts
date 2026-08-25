import { describe, it, expect } from "vitest";
import { compareChunks, jaccardSimilarity } from "@/lib/originality/similarity";
import { normalizeText } from "@/lib/originality/normalize";

describe("compareChunks", () => {
  it("scores identical normalized text as an exact match", () => {
    const text = normalizeText("Artificial intelligence is transforming education around the world.");
    const result = compareChunks(text, text);
    expect(result).toEqual({ type: "exact", score: 1 });
  });

  it("scores completely unrelated text as no match", () => {
    const a = normalizeText("The quick brown fox jumps over the lazy dog near the riverbank.");
    const b = normalizeText("Quantum computing relies on superposition and entanglement principles.");
    const result = compareChunks(a, b);
    expect(result.type).toBeNull();
    expect(result.score).toBeLessThan(0.5);
  });

  it("scores a lightly edited copy (one word changed) as near_exact, not exact", () => {
    const original = normalizeText("Artificial intelligence is transforming higher education around the world today.");
    const edited = normalizeText("Artificial intelligence is transforming higher education around the globe today.");
    const result = compareChunks(original, edited);
    expect(result.type).toBe("near_exact");
    expect(result.score).toBeGreaterThanOrEqual(0.5);
    expect(result.score).toBeLessThan(1);
  });

  it("treats empty input as no match rather than throwing", () => {
    expect(compareChunks("", "something")).toEqual({ type: null, score: 0 });
    expect(compareChunks("something", "")).toEqual({ type: null, score: 0 });
  });

  it("detects a passage copied verbatim INTO a longer original paragraph (containment case)", () => {
    const source = normalizeText(
      "Artificial intelligence is transforming higher education around the world today and universities are adopting new tools.",
    );
    const copiedIntoLongerText = normalizeText(
      "In this essay I will argue several points about modern schooling. " +
        "Artificial intelligence is transforming higher education around the world today and universities are adopting new tools. " +
        "I personally believe this shift raises important questions for students everywhere in the coming decade.",
    );
    const result = compareChunks(source, copiedIntoLongerText);
    // Pure Jaccard scores this poorly because of the length difference —
    // containment is what catches it. Without that, this common real-world
    // pattern would go undetected.
    expect(result.type).toBe("near_exact");
  });

  it("does NOT manufacture a match from a short shared heading (containment false-positive guard)", () => {
    const heading = normalizeText("Introduction");
    const documentContainingThatWord = normalizeText(
      "Introduction to the study of marine biology and the many species found in coastal waters.",
    );
    // Containment would score this 1.0 (the single shingle is fully
    // contained), which would be an accusation generated from a heading.
    expect(compareChunks(heading, documentContainingThatWord).type).toBeNull();
  });
});

describe("jaccardSimilarity", () => {
  it("is 1 for identical sets", () => {
    const a = new Set(["a", "b", "c"]);
    expect(jaccardSimilarity(a, a)).toBe(1);
  });

  it("is 0 for disjoint sets", () => {
    expect(jaccardSimilarity(new Set(["a"]), new Set(["b"]))).toBe(0);
  });

  it("is 0, not NaN, when either set is empty", () => {
    expect(jaccardSimilarity(new Set(), new Set(["a"]))).toBe(0);
    expect(jaccardSimilarity(new Set(), new Set())).toBe(0);
  });
});
