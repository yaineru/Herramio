import { describe, it, expect } from "vitest";
import { compareDocuments } from "@/lib/originality/comparison/compare-documents";

const ORIGINAL = `Artificial intelligence is transforming higher education around the world today.
Universities are adopting new tools to support students and faculty in research and teaching.

The second paragraph discusses methodology and the instruments used during the study period.`;

const EXACT_COPY = ORIGINAL;

const NEAR_COPY = `Artificial intelligence is rapidly transforming higher education around the world today.
Universities are increasingly adopting new tools to support students and faculty in research and teaching.

The second paragraph discusses methodology and the instruments used during the study period.`;

const UNRELATED = `The migratory patterns of arctic terns span from the Arctic to the Antarctic each year.
These birds experience more daylight than any other creature on the planet.

Ocean currents influence their routes in ways researchers are still mapping today.`;

const PARAPHRASE = `Machine learning technologies are reshaping university-level instruction globally.
Academic institutions increasingly deploy software that assists scholars and teaching staff.

An alternative section describes the approach and the apparatus applied throughout the trial.`;

describe("compareDocuments — lexical (no semantic provider)", () => {
  it("reports full similarity for an exact copy", () => {
    const r = compareDocuments(ORIGINAL, EXACT_COPY);
    expect(r.overallSimilarity).toBe(1);
    expect(r.exactMatchCount).toBeGreaterThan(0);
  });

  it("detects a near copy with inserted words", () => {
    const r = compareDocuments(ORIGINAL, NEAR_COPY);
    expect(r.overallSimilarity).toBeGreaterThan(0.5);
    expect(r.matches.length).toBeGreaterThan(0);
  });

  it("reports no similarity between unrelated documents", () => {
    const r = compareDocuments(ORIGINAL, UNRELATED);
    expect(r.overallSimilarity).toBe(0);
    expect(r.matches).toEqual([]);
  });

  it("does NOT detect a paraphrase lexically — the documented limitation", () => {
    const r = compareDocuments(ORIGINAL, PARAPHRASE);
    expect(r.overallSimilarity).toBe(0);
  });

  it("always states that semantic analysis was unavailable, rather than staying silent", () => {
    const r = compareDocuments(ORIGINAL, UNRELATED);
    expect(r.semanticState).toBe("semantic_unavailable");
    expect(r.semanticNotice).toContain("no está configurado");
  });

  it("handles empty documents without dividing by zero", () => {
    const r = compareDocuments("", "");
    expect(r.overallSimilarity).toBe(0);
    expect(r.aChunkCount).toBe(0);
    expect(r.bChunkCount).toBe(0);
  });

  it("uses max coverage, not average, so a short document copied into a long one still reports high", () => {
    const shortDoc = `Artificial intelligence is transforming higher education around the world today.
Universities are adopting new tools to support students and faculty in research and teaching.`;
    const longDoc = `${shortDoc}

Then many additional paragraphs of entirely original writing follow this section.

Another unrelated paragraph about ocean currents and migratory birds appears here too.

And a third paragraph discussing something completely different from the first one.`;

    const r = compareDocuments(shortDoc, longDoc);
    // Coverage of the short doc is high; of the long doc it is low.
    // Averaging would hide the copy — max must surface it.
    expect(r.coverageOfA).toBeGreaterThan(0.9);
    expect(r.coverageOfB).toBeLessThan(0.5);
    expect(r.overallSimilarity).toBe(r.coverageOfA);
  });

  it("records the engine version so a stored comparison stays attributable", () => {
    expect(compareDocuments(ORIGINAL, EXACT_COPY).engineVersion).toBe("1.0.0");
  });

  it("never claims attribution in a raw A-vs-B comparison (no citation context exists there)", () => {
    const r = compareDocuments(ORIGINAL, EXACT_COPY);
    for (const m of r.matches) {
      expect(m.decision.classification).not.toBe("attributed_match");
    }
  });
});

describe("compareDocuments — with a semantic scorer supplied", () => {
  it("surfaces a paraphrase that the lexical engine alone cannot see", () => {
    // Simulates a configured provider by injecting scores directly. This
    // does NOT fabricate embeddings — it verifies the wiring so that a
    // real provider drops in without changing this engine.
    const r = compareDocuments(ORIGINAL, PARAPHRASE, { semanticScorer: () => 0.93 });
    expect(r.semanticState).toBe("semantic_available");
    expect(r.semanticNotice).toBeNull();
    expect(r.matches.length).toBeGreaterThan(0);
    expect(r.semanticMatchCount).toBeGreaterThan(0);
  });

  it("ignores weak semantic scores rather than inventing matches", () => {
    const r = compareDocuments(ORIGINAL, UNRELATED, { semanticScorer: () => 0.4 });
    expect(r.matches).toEqual([]);
    expect(r.overallSimilarity).toBe(0);
  });

  it("treats a null score from the scorer as 'not assessed', not as zero similarity", () => {
    const r = compareDocuments(ORIGINAL, EXACT_COPY, { semanticScorer: () => null });
    // Lexical evidence still stands on its own.
    expect(r.overallSimilarity).toBe(1);
    for (const m of r.matches) expect(m.semanticScore).toBeNull();
  });
});
