import { describe, it, expect } from "vitest";
import { generateSourceQueries, scoreQueryCandidate } from "@/lib/originality/retrieval/query-generator";

const TECHNICAL =
  "Convolutional architectures demonstrated substantial improvements in radiological segmentation accuracy across heterogeneous imaging modalities";
const GENERIC = "In this study the results show that it is important to note that further research is needed";
const SHORT = "It was good";
const REPETITIVE = "data data data data data data data data data data";

describe("scoreQueryCandidate", () => {
  it("scores technical, varied prose highly", () => {
    expect(scoreQueryCandidate(TECHNICAL).score).toBeGreaterThan(0.6);
  });

  it("penalises stock academic phrasing that matches every paper", () => {
    const generic = scoreQueryCandidate(GENERIC);
    expect(generic.score).toBeLessThan(scoreQueryCandidate(TECHNICAL).score);
    expect(generic.reason).toContain("genéricas");
  });

  it("rejects fragments too short to identify anything", () => {
    expect(scoreQueryCandidate(SHORT).score).toBe(0);
  });

  it("penalises repetition — repeated words add no unique signal", () => {
    expect(scoreQueryCandidate(REPETITIVE).score).toBeLessThan(scoreQueryCandidate(TECHNICAL).score);
  });

  it("is deterministic", () => {
    expect(scoreQueryCandidate(TECHNICAL).score).toBe(scoreQueryCandidate(TECHNICAL).score);
  });
});

describe("generateSourceQueries", () => {
  const chunks = [
    { sequence: 0, text: TECHNICAL },
    { sequence: 1, text: GENERIC },
    { sequence: 2, text: SHORT },
    { sequence: 3, text: "Introduction" },
    {
      sequence: 4,
      text: "Electrochemical impedance spectroscopy revealed unexpected interfacial resistance in the polymer electrolyte samples",
    },
  ];

  it("never emits one query per sentence — it selects, which is the whole cost control", () => {
    const queries = generateSourceQueries(chunks);
    expect(queries.length).toBeLessThan(chunks.length);
  });

  it("selects the technical fragments and drops headings and filler", () => {
    const selected = generateSourceQueries(chunks).map((q) => q.chunkSequence);
    expect(selected).toContain(0);
    expect(selected).toContain(4);
    expect(selected).not.toContain(2); // too short
    expect(selected).not.toContain(3); // heading
  });

  it("honours the query budget", () => {
    expect(generateSourceQueries(chunks, { maxQueries: 1 })).toHaveLength(1);
  });

  it("returns queries ordered by quality, best first", () => {
    const queries = generateSourceQueries(chunks);
    const scores = queries.map((q) => q.qualityScore);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  it("caps query length so a whole paragraph is never sent as one query", () => {
    const long = { sequence: 0, text: Array.from({ length: 200 }, (_, i) => `distinctive${i}`).join(" ") };
    const [query] = generateSourceQueries([long]);
    expect(query.text.split(/\s+/).length).toBeLessThanOrEqual(25);
  });

  it("returns nothing rather than low-value queries when a document has no distinctive content", () => {
    expect(generateSourceQueries([{ sequence: 0, text: SHORT }, { sequence: 1, text: "Introduction" }])).toEqual([]);
  });

  it("explains why each query was chosen, so a bad selection is diagnosable", () => {
    for (const q of generateSourceQueries(chunks)) {
      expect(q.reason.length).toBeGreaterThan(0);
    }
  });
});
