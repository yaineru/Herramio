import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { verifyReferenceViaCrossref } from "@/lib/originality/providers/crossref";

const originalFetch = global.fetch;

describe("verifyReferenceViaCrossref", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns not_found without calling fetch for a query that's too short to be a real reference", async () => {
    const result = await verifyReferenceViaCrossref("Smith");
    expect(result.status).toBe("not_found");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns verified with DOI/title/url when Crossref returns a genuinely matching work", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        message: { items: [{ DOI: "10.1234/example", title: ["Attention Is All You Need"], URL: "https://doi.org/10.1234/example" }] },
      }),
    } as Response);

    const result = await verifyReferenceViaCrossref("Attention is all you need Vaswani 2017");
    expect(result).toEqual({
      status: "verified",
      matchedDoi: "10.1234/example",
      matchedTitle: "Attention Is All You Need",
      matchedUrl: "https://doi.org/10.1234/example",
    });
  });

  it("does NOT verify a fabricated reference against an unrelated real paper", async () => {
    // Regression test for a real dishonesty bug found in live testing:
    // Crossref's query.bibliographic always returns its best fuzzy match
    // with no quality floor, and its `score` is unusable as confidence
    // (measured: pure nonsense scored HIGHER than a real paper). Without
    // a title check, invented references got stamped "verified" against
    // whatever real work ranked first — exactly the kind of false claim
    // this product must never make.
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        message: {
          items: [
            {
              DOI: "10.23977/aetp.2025.090505",
              title: ["A Study on Artificial Intelligence-Assisted Teaching Models in College"],
              URL: "https://doi.org/10.23977/aetp.2025.090505",
            },
          ],
        },
      }),
    } as Response);

    const result = await verifyReferenceViaCrossref(
      "Smith, J. (2021). A study of artificial intelligence in education. Journal of Educational Technology.",
    );
    expect(result.status).toBe("not_found");
    expect(result.matchedDoi).toBeNull();
  });

  it("does NOT verify a nonsense reference against whatever Crossref returns", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        message: {
          items: [{ DOI: "10.1111/whatever", title: ["No Right to Exist Anywhere on This Earth"], URL: "https://doi.org/10.1111/whatever" }],
        },
      }),
    } as Response);

    const result = await verifyReferenceViaCrossref("Zqxjv Blorptak nonsense fabricated title that cannot exist 12345");
    expect(result.status).toBe("not_found");
  });

  it("still verifies when the query is a full bibliography line and the response is just the title", async () => {
    // Length asymmetry between a full reference line and a bare title is
    // normal and must not itself cause a rejection.
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        message: {
          items: [{ DOI: "10.5555/real", title: ["Machine learning applications in universities"], URL: "https://doi.org/10.5555/real" }],
        },
      }),
    } as Response);

    const result = await verifyReferenceViaCrossref(
      "Jones, A. (2018). Machine learning applications in universities. Some Publisher.",
    );
    expect(result.status).toBe("verified");
    expect(result.matchedDoi).toBe("10.5555/real");
  });

  it("verifies from a full reference line even when it carries author, year AND journal after the title", async () => {
    // Regression test for a real bug found in live E2E: the pipeline used
    // to query with the *parsed* title, but the reference parser greedily
    // includes the journal name ("Attention is all you need. Advances in
    // Neural Information Processing Systems."), diluting the similarity
    // score below threshold. The canonical paper returned `not_found`
    // from parsedTitle but `verified` from the raw line — so the pipeline
    // now always passes the full line.
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        message: {
          items: [{ DOI: "10.5555/vaswani", title: ["Attention Is All You Need"], URL: "https://doi.org/10.5555/vaswani" }],
        },
      }),
    } as Response);

    const result = await verifyReferenceViaCrossref(
      "Vaswani, A. (2017). Attention is all you need. Advances in Neural Information Processing Systems.",
    );
    expect(result.status).toBe("verified");
    expect(result.matchedDoi).toBe("10.5555/vaswani");
  });

  it("returns not_found when Crossref returns a DOI but no title to check against", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ message: { items: [{ DOI: "10.1234/untitled" }] } }),
    } as Response);

    const result = await verifyReferenceViaCrossref("Some reasonably long reference query here");
    expect(result.status).toBe("not_found");
  });

  it("returns not_found (never throws or fabricates a match) when Crossref returns no items", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ message: { items: [] } }),
    } as Response);

    const result = await verifyReferenceViaCrossref("Some obscure unpublished manuscript nobody indexed");
    expect(result.status).toBe("not_found");
    expect(result.matchedDoi).toBeNull();
  });

  it("returns not_found (not a thrown error) when the Crossref response isn't ok", async () => {
    vi.mocked(global.fetch).mockResolvedValue({ ok: false } as Response);
    const result = await verifyReferenceViaCrossref("A reasonably long reference query string here");
    expect(result.status).toBe("not_found");
  });

  it("returns not_found (not a thrown error) when fetch itself fails — a network blip must never break the pipeline", async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error("network down"));
    const result = await verifyReferenceViaCrossref("A reasonably long reference query string here");
    expect(result.status).toBe("not_found");
  });

  it("requests Crossref's own fixed API host — never a URL derived from the reference text (no SSRF surface)", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ message: { items: [] } }),
    } as Response);

    await verifyReferenceViaCrossref("http://169.254.169.254/latest/meta-data/ as a reference title, long enough");

    const calledUrl = vi.mocked(global.fetch).mock.calls[0][0] as URL;
    expect(calledUrl.hostname).toBe("api.crossref.org");
  });
});
