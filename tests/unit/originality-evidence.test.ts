import { describe, it, expect } from "vitest";
import {
  classifyMatch,
  semanticBand,
  CLASSIFICATION_LABELS,
  evaluateHybridEvidence,
  type MatchEvidence,
} from "@/lib/originality/evidence";

function evidence(overrides: Partial<MatchEvidence> = {}): MatchEvidence {
  return { lexicalScore: 0, semanticScore: null, isCited: false, sourceConfidence: "certain", ...overrides };
}

describe("semanticBand", () => {
  it("returns 'none' when semantic analysis was not performed — never conflates 'not assessed' with 'no similarity'", () => {
    expect(semanticBand(null)).toBe("none");
  });

  it("bands scores rather than applying a single plagiarism cutoff", () => {
    expect(semanticBand(0.95)).toBe("high");
    expect(semanticBand(0.85)).toBe("medium");
    expect(semanticBand(0.77)).toBe("low");
    expect(semanticBand(0.5)).toBe("none");
  });
});

describe("evaluateHybridEvidence", () => {
  it("keeps lexical decisions when semantic analysis is unavailable", () => {
    const decision = evaluateHybridEvidence(evidence({ lexicalScore: 0.7, semanticScore: null }));
    expect(decision.mode).toBe("lexical");
    expect(decision.semanticState).toBe("semantic_unavailable");
    expect(decision.classification).toBe("strong_similarity");
    expect(decision.reviewRequired).toBe(true);
  });

  it("promotes weak lexical matches when semantics are strong", () => {
    const decision = evaluateHybridEvidence(evidence({ lexicalScore: 0.12, semanticScore: 0.91 }));
    expect(decision.mode).toBe("semantic");
    expect(decision.classification).toBe("review_required");
    expect(decision.reviewRequired).toBe(true);
  });

  it("combines both signals when they point in the same direction", () => {
    const decision = evaluateHybridEvidence(evidence({ lexicalScore: 0.46, semanticScore: 0.86 }));
    expect(decision.mode).toBe("hybrid");
    expect(decision.classification).toBe("strong_similarity");
    expect(decision.reviewRequired).toBe(true);
    expect(decision.effectiveScore).toBeGreaterThan(0.7);
  });

  it("keeps lexical evidence primary when semantic confidence is low", () => {
    const decision = evaluateHybridEvidence(evidence({ lexicalScore: 0.68, semanticScore: 0.55 }));
    expect(decision.mode).toBe("lexical");
    expect(decision.classification).toBe("moderate_similarity");
    expect(decision.semanticState).toBe("semantic_available");
  });

  it("treats a strongly cited semantic match as attributed rather than an unattributed copy", () => {
    const decision = evaluateHybridEvidence(evidence({ lexicalScore: 0.18, semanticScore: 0.94, isCited: true }));
    expect(decision.mode).toBe("semantic");
    expect(decision.classification).toBe("attributed_match");
    expect(decision.reviewRequired).toBe(false);
  });

  it("returns no_match when there is no evidence to support a match", () => {
    const decision = evaluateHybridEvidence(evidence({ lexicalScore: 0.02, semanticScore: 0.08 }));
    expect(decision.mode).toBe("none");
    expect(decision.classification).toBe("no_match");
    expect(decision.reviewRequired).toBe(false);
  });
});

describe("classifyMatch", () => {
  it("classifies a verbatim match as exact_copy", () => {
    const r = classifyMatch(evidence({ lexicalScore: 1 }));
    expect(r.classification).toBe("exact_copy");
  });

  it("classifies substantial overlap as near_copy and states the percentage", () => {
    const r = classifyMatch(evidence({ lexicalScore: 0.72 }));
    expect(r.classification).toBe("near_copy");
    expect(r.explanation).toContain("72%");
  });

  it("treats a cited passage as attributed EVEN when the text matches verbatim", () => {
    // The core product rule: quoting is not copying. A cited exact match
    // must never be presented like an unattributed one.
    const r = classifyMatch(evidence({ lexicalScore: 1, isCited: true }));
    expect(r.classification).toBe("attributed_quote");
    expect(r.explanation).toContain("cita");
  });

  it("uses semantic evidence only when lexical evidence is weak", () => {
    const r = classifyMatch(evidence({ lexicalScore: 0.1, semanticScore: 0.93 }));
    expect(r.classification).toBe("semantic_similarity");
  });

  it("does not escalate a weak semantic score", () => {
    const r = classifyMatch(evidence({ lexicalScore: 0.1, semanticScore: 0.76 }));
    expect(r.classification).toBe("weak_signal");
  });

  it("falls back to weak_signal when nothing is conclusive", () => {
    expect(classifyMatch(evidence({ lexicalScore: 0.2 })).classification).toBe("weak_signal");
  });

  it("never uses the word 'plagio' in any user-facing label or explanation", () => {
    // Guards the product's honesty rule at the code level, so no future
    // copy edit can quietly reintroduce an accusation.
    const all = [
      ...Object.values(CLASSIFICATION_LABELS),
      classifyMatch(evidence({ lexicalScore: 1 })).explanation,
      classifyMatch(evidence({ lexicalScore: 0.7 })).explanation,
      classifyMatch(evidence({ lexicalScore: 1, isCited: true })).explanation,
      classifyMatch(evidence({ lexicalScore: 0.1, semanticScore: 0.95 })).explanation,
      classifyMatch(evidence({ lexicalScore: 0.1 })).explanation,
    ];
    for (const text of all) {
      expect(text.toLowerCase()).not.toContain("plagio");
    }
  });

  it("always preserves the raw evidence alongside the classification so the result stays explainable", () => {
    const e = evidence({ lexicalScore: 0.8, semanticScore: 0.91, sourceConfidence: "medium" });
    const r = classifyMatch(e);
    expect(r.evidence).toEqual(e);
  });
});
