import { describe, it, expect } from "vitest";
import {
  deduplicateCandidates,
  getSearchProviders,
  isExternalRetrievalAvailable,
  OpenAlexSearchProvider,
  WebSearchProvider,
  SourceProviderNotConfiguredError,
  type SourceCandidate,
} from "@/lib/originality/retrieval/providers";
import { rankSources, assessConfidence, metadataCompleteness } from "@/lib/originality/retrieval/ranker";

function candidate(overrides: Partial<SourceCandidate> = {}): SourceCandidate {
  return {
    url: "https://example.com/paper",
    title: "A Paper",
    snippet: "some text",
    doi: null,
    authors: [],
    publishedYear: null,
    kind: "web",
    providerRelevance: null,
    providerName: "test",
    ...overrides,
  };
}

describe("source providers — nothing is fabricated", () => {
  it("reports no external retrieval configured, which is the truth today", () => {
    expect(getSearchProviders()).toEqual([]);
    expect(isExternalRetrievalAvailable()).toBe(false);
  });

  it("OpenAlex throws instead of returning empty results when unconfigured", async () => {
    // Throwing makes a misconfiguration loud. Returning [] would be
    // indistinguishable from "searched and genuinely found nothing".
    await expect(new OpenAlexSearchProvider(null).search()).rejects.toThrow(SourceProviderNotConfiguredError);
  });

  it("web search throws instead of returning empty results when unconfigured", async () => {
    await expect(new WebSearchProvider(null).search()).rejects.toThrow(SourceProviderNotConfiguredError);
  });
});

describe("deduplicateCandidates", () => {
  it("collapses the same work returned under different URLs via DOI", () => {
    const result = deduplicateCandidates([
      candidate({ doi: "10.1/x", url: "https://publisher.com/a" }),
      candidate({ doi: "10.1/X", url: "https://mirror.org/b" }),
    ]);
    expect(result).toHaveLength(1);
  });

  it("treats URLs differing only by www, trailing slash or tracking params as one source", () => {
    const result = deduplicateCandidates([
      candidate({ url: "https://www.example.com/paper/" }),
      candidate({ url: "https://example.com/paper?utm_source=x#intro" }),
    ]);
    expect(result).toHaveLength(1);
  });

  it("keeps the richer copy when collapsing duplicates", () => {
    const result = deduplicateCandidates([
      candidate({ doi: "10.1/x", title: null, authors: [] }),
      candidate({ doi: "10.1/x", title: "Full Title", authors: ["A"], publishedYear: 2020 }),
    ]);
    expect(result[0].title).toBe("Full Title");
  });

  it("keeps genuinely distinct sources apart", () => {
    const result = deduplicateCandidates([
      candidate({ url: "https://a.com/one" }),
      candidate({ url: "https://b.com/two" }),
    ]);
    expect(result).toHaveLength(2);
  });
});

describe("assessConfidence — identity is separate from similarity", () => {
  const base = { lexicalSimilarity: 0, semanticSimilarity: null, metadataCompleteness: 0, citedInDocument: false };

  it("rates a cited, well-identified source as high confidence", () => {
    expect(assessConfidence({ ...base, citedInDocument: true, metadataCompleteness: 0.8 }).confidence).toBe("high");
  });

  it("does NOT rate a strong text match as high confidence when the source is poorly identified", () => {
    // The distinction that matters: matching text does not prove you have
    // correctly identified where it came from.
    const r = assessConfidence({ ...base, lexicalSimilarity: 0.95, metadataCompleteness: 0.2 });
    expect(r.confidence).toBe("medium");
    expect(r.rationale).toContain("incompletos");
  });

  it("rates weak evidence as low and says it should not stand alone", () => {
    const r = assessConfidence({ ...base, lexicalSimilarity: 0.2, metadataCompleteness: 0.2 });
    expect(r.confidence).toBe("low");
    expect(r.rationale).toContain("no debería tratarse como evidencia por sí sola");
  });
});

describe("rankSources", () => {
  const signals = { lexicalSimilarity: 0, semanticSimilarity: null, metadataCompleteness: 0, citedInDocument: false };

  it("orders by locally-computed similarity, not by the provider's own score", () => {
    // Regression guard for the Crossref lesson: a provider claiming high
    // relevance must not outrank a candidate that actually matches better.
    const ranked = rankSources([
      { candidate: candidate({ providerRelevance: 99 }), signals: { ...signals, lexicalSimilarity: 0.1 } },
      { candidate: candidate({ providerRelevance: 1, url: "https://other.com/x" }), signals: { ...signals, lexicalSimilarity: 0.9 } },
    ]);
    expect(ranked[0].signals.lexicalSimilarity).toBe(0.9);
  });

  it("boosts a source the document already cites", () => {
    const ranked = rankSources([
      { candidate: candidate({ url: "https://a.com" }), signals: { ...signals, lexicalSimilarity: 0.5 } },
      { candidate: candidate({ url: "https://b.com" }), signals: { ...signals, lexicalSimilarity: 0.5, citedInDocument: true } },
    ]);
    expect(ranked[0].candidate.url).toBe("https://b.com");
  });

  it("attaches a rationale to every ranked source", () => {
    for (const r of rankSources([{ candidate: candidate(), signals }])) {
      expect(r.rationale.length).toBeGreaterThan(0);
    }
  });

  it("treats a null semantic score as not-assessed rather than zero penalty confusion", () => {
    const withNull = rankSources([{ candidate: candidate(), signals: { ...signals, lexicalSimilarity: 0.8 } }]);
    expect(withNull[0].rankScore).toBeGreaterThan(0);
  });
});

describe("metadataCompleteness", () => {
  it("scores a fully-identified source at 1", () => {
    expect(
      metadataCompleteness(candidate({ doi: "10.1/x", title: "T", url: "https://x.com", publishedYear: 2020, authors: ["A"] })),
    ).toBe(1);
  });

  it("scores a bare candidate low", () => {
    expect(metadataCompleteness(candidate({ url: null, title: null, doi: null }))).toBeLessThan(0.5);
  });
});
