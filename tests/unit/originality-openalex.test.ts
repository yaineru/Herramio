import { describe, expect, it, vi, afterEach } from "vitest";
import { reconstructAbstract, toCandidate, searchOpenAlex, lookupOpenAlexByDoi } from "@/lib/originality/retrieval/openalex";

/**
 * Offline tests for the OpenAlex adapter. The network shape they mock was
 * taken from real responses (see the commit message for what the live API
 * actually returned), not invented.
 */

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.OPENALEX_API_KEY;
});

function mockFetch(status: number, body: unknown) {
  const spy = vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  }));
  vi.stubGlobal("fetch", spy);
  return spy;
}

describe("reconstructAbstract", () => {
  it("rebuilds text from OpenAlex's inverted index", () => {
    // OpenAlex ships abstracts as word -> positions for licensing reasons.
    expect(reconstructAbstract({ La: [0], inteligencia: [1], artificial: [2] })).toBe("La inteligencia artificial");
  });

  it("handles a word appearing at several positions", () => {
    expect(reconstructAbstract({ el: [0, 2], gato: [1], perro: [3] })).toBe("el gato el perro");
  });

  it("returns null rather than an empty string when there is no abstract", () => {
    expect(reconstructAbstract(null)).toBeNull();
    expect(reconstructAbstract(undefined)).toBeNull();
    expect(reconstructAbstract({})).toBeNull();
  });

  it("caps length so the report stores evidence, not whole abstracts", () => {
    const index: Record<string, number[]> = {};
    for (let i = 0; i < 400; i++) index[`palabra${i}`] = [i];
    const out = reconstructAbstract(index, 100)!;
    expect(out.length).toBeLessThanOrEqual(101);
    expect(out.endsWith("…")).toBe(true);
  });
});

describe("toCandidate", () => {
  it("normalises a real work into the shared candidate shape", () => {
    const c = toCandidate({
      id: "https://openalex.org/W4395957952",
      doi: "https://doi.org/10.54675/ewzm9535",
      display_name: "Guidance for generative AI in education and research",
      publication_year: 2023,
      relevance_score: 42.5,
      authorships: [{ author: { display_name: "Jane Doe" } }],
      primary_location: { landing_page_url: "https://example.org/paper" },
    });
    expect(c.title).toBe("Guidance for generative AI in education and research");
    expect(c.publishedYear).toBe(2023);
    expect(c.authors).toEqual(["Jane Doe"]);
    expect(c.kind).toBe("academic");
    expect(c.providerName).toBe("openalex");
  });

  it("strips the resolver prefix from the DOI but keeps it in the URL", () => {
    const c = toCandidate({ doi: "https://doi.org/10.1234/abc", display_name: "X" });
    expect(c.doi).toBe("10.1234/abc");
    // The DOI resolver is the canonical URL: a publisher landing page moves.
    expect(c.url).toBe("https://doi.org/10.1234/abc");
  });

  it("keeps providerRelevance separate from confidence", () => {
    // Same rule as Crossref's score, learned the hard way: a provider's
    // own relevance figure is an input to ranking, never a verdict.
    const c = toCandidate({ display_name: "X", relevance_score: 999 });
    expect(c.providerRelevance).toBe(999);
    expect(c).not.toHaveProperty("confidence");
  });

  it("never throws on a work with no metadata at all", () => {
    const c = toCandidate({});
    expect(c.title).toBeNull();
    expect(c.doi).toBeNull();
    expect(c.authors).toEqual([]);
    expect(c.publishedYear).toBeNull();
  });

  it("caps the author list", () => {
    const authorships = Array.from({ length: 50 }, (_, i) => ({ author: { display_name: `A${i}` } }));
    expect(toCandidate({ display_name: "X", authorships }).authors).toHaveLength(10);
  });
});

describe("searchOpenAlex", () => {
  it("returns normalised candidates", async () => {
    mockFetch(200, { results: [{ display_name: "Un paper", publication_year: 2020 }] });
    const r = await searchOpenAlex("inteligencia artificial");
    expect(r.unavailableReason).toBeNull();
    expect(r.candidates).toHaveLength(1);
    expect(r.candidates[0].title).toBe("Un paper");
  });

  it("does not call the network for an empty query", async () => {
    const spy = mockFetch(200, { results: [] });
    const r = await searchOpenAlex("   ");
    expect(spy).not.toHaveBeenCalled();
    expect(r.requestCount).toBe(0);
    expect(r.unavailableReason).toBe("empty_query");
  });

  it("reports rate limiting as a reason instead of as zero results", async () => {
    // "No sources found" and "we were throttled" are different facts, and
    // the report must not present the second as the first.
    mockFetch(429, {});
    const r = await searchOpenAlex("algo");
    expect(r.candidates).toEqual([]);
    expect(r.unavailableReason).toBe("rate_limited");
  });

  it("treats 401/403 as not configured rather than crashing", async () => {
    mockFetch(403, {});
    expect((await searchOpenAlex("algo")).unavailableReason).toBe("not_configured");
  });

  it("survives a network failure without throwing", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("ECONNRESET"); }));
    const r = await searchOpenAlex("algo");
    expect(r.candidates).toEqual([]);
    expect(r.unavailableReason).toMatch(/network/);
  });

  it("sends the mailto courtesy parameter when configured", async () => {
    process.env.OPENALEX_MAILTO = "qa@example.org";
    const spy = mockFetch(200, { results: [] });
    await searchOpenAlex("algo");
    expect(String((spy.mock.calls as unknown as unknown[][])[0][0])).toContain("mailto=qa%40example.org");
  });
});

describe("lookupOpenAlexByDoi", () => {
  it("returns the exact work for a known DOI", async () => {
    mockFetch(200, { id: "https://openalex.org/W1", doi: "https://doi.org/10.1/x", display_name: "Exacto" });
    const r = await lookupOpenAlexByDoi("10.1/x");
    expect(r.candidates).toHaveLength(1);
    expect(r.candidates[0].title).toBe("Exacto");
  });

  it("accepts a DOI that already carries the resolver prefix", async () => {
    const spy = mockFetch(200, { id: "https://openalex.org/W1", display_name: "X" });
    await lookupOpenAlexByDoi("https://doi.org/10.1/x");
    expect(String((spy.mock.calls as unknown as unknown[][])[0][0])).not.toContain("doi.org/https");
  });

  it("treats a DOI that is simply absent as a legitimate empty answer", async () => {
    // Not in OpenAlex is a fact about the index, not an outage. Reporting
    // it as unavailable would make the engine look broken when it is not.
    mockFetch(404, {});
    const r = await lookupOpenAlexByDoi("10.9999/no-existe");
    expect(r.candidates).toEqual([]);
    expect(r.unavailableReason).toBeNull();
  });

  it("does not call the network for an empty DOI", async () => {
    const spy = mockFetch(200, {});
    expect((await lookupOpenAlexByDoi("  ")).requestCount).toBe(0);
    expect(spy).not.toHaveBeenCalled();
  });
});
