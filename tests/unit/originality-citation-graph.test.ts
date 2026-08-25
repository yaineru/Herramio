import { describe, it, expect } from "vitest";
import { buildCitationGraph } from "@/lib/originality/citation-graph";
import type { OriginalityCitation, OriginalityReference } from "@/lib/originality/types";

function citation(id: number, rawText: string): OriginalityCitation {
  return { id, documentId: "doc-1", chunkId: 1, rawText, styleGuess: "apa" };
}

function reference(id: number, rawText: string, parsedAuthor: string | null, parsedYear: string | null): OriginalityReference {
  return {
    id,
    documentId: "doc-1",
    rawText,
    parsedAuthor,
    parsedYear,
    parsedTitle: null,
    verificationStatus: "unverified",
    matchedDoi: null,
    matchedTitle: null,
    matchedUrl: null,
  };
}

describe("buildCitationGraph", () => {
  it("links an author-year citation to its matching bibliography entry", () => {
    const graph = buildCitationGraph(
      [citation(1, "(Smith, 2021)")],
      [reference(10, "Smith, J. (2021). A study of things.", "Smith, J", "2021")],
    );

    expect(graph.entries[0].matchedReference?.id).toBe(10);
    expect(graph.orphanCitations).toHaveLength(0);
    expect(graph.uncitedReferences).toHaveLength(0);
  });

  it("flags a citation with no matching reference as an orphan", () => {
    const graph = buildCitationGraph(
      [citation(1, "(Nakamura, 2019)")],
      [reference(10, "Smith, J. (2021). A study of things.", "Smith, J", "2021")],
    );

    expect(graph.orphanCitations).toHaveLength(1);
    expect(graph.orphanCitations[0].rawText).toBe("(Nakamura, 2019)");
  });

  it("does not match when the surname agrees but the year does not (two works by the same author)", () => {
    const graph = buildCitationGraph(
      [citation(1, "(Smith, 2018)")],
      [reference(10, "Smith, J. (2021). A study of things.", "Smith, J", "2021")],
    );

    expect(graph.entries[0].matchedReference).toBeNull();
    expect(graph.orphanCitations).toHaveLength(1);
  });

  it("reports references that are never cited in the text", () => {
    const graph = buildCitationGraph(
      [citation(1, "(Smith, 2021)")],
      [
        reference(10, "Smith, J. (2021). A study of things.", "Smith, J", "2021"),
        reference(11, "Jones, A. (2019). Never cited anywhere.", "Jones, A", "2019"),
      ],
    );

    expect(graph.uncitedReferences).toHaveLength(1);
    expect(graph.uncitedReferences[0].id).toBe(11);
  });

  it("skips numeric-style citations instead of guessing which reference they point to", () => {
    // Matching [12] by position would look confident and be frequently
    // wrong — worse than staying silent for a self-review tool.
    const graph = buildCitationGraph(
      [citation(1, "[12]")],
      [reference(10, "Smith, J. (2021). A study of things.", "Smith, J", "2021")],
    );

    expect(graph.entries[0].matchedReference).toBeNull();
    expect(graph.orphanCitations).toHaveLength(0); // not an orphan — just unanalyzable
  });

  it("matches an et al. citation to its reference", () => {
    const graph = buildCitationGraph(
      [citation(1, "(Jones et al., 2020)")],
      [reference(10, "Jones, A., Smith, B., & Lee, C. (2020). Collaborative work.", "Jones, A", "2020")],
    );

    expect(graph.entries[0].matchedReference?.id).toBe(10);
  });

  it("handles a document with citations but no references at all", () => {
    const graph = buildCitationGraph([citation(1, "(Smith, 2021)")], []);
    expect(graph.orphanCitations).toHaveLength(1);
    expect(graph.uncitedReferences).toHaveLength(0);
  });

  it("handles a document with references but no citations", () => {
    const graph = buildCitationGraph([], [reference(10, "Smith, J. (2021). A study.", "Smith, J", "2021")]);
    expect(graph.entries).toHaveLength(0);
    expect(graph.uncitedReferences).toHaveLength(1);
  });
});
