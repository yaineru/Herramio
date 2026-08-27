import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Cost ceiling on the semantic pass.
 *
 * File size is capped per plan, but size and chunk count are not the same
 * thing: a plain-text file well inside the limit can produce thousands of
 * paragraphs, and each one would be a paid vector. Without this ceiling a
 * single upload could cost more than the plan that allowed it.
 */

const getEmbeddingProvider = vi.fn();
const embedChunks = vi.fn();

vi.mock("@/lib/originality/semantic/resolve", () => ({ getEmbeddingProvider }));
vi.mock("@/lib/originality/semantic/embed-chunks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/originality/semantic/embed-chunks")>();
  return { ...actual, embedChunks };
});

const { analyseSemantically, MAX_CHUNKS_PER_DOCUMENT } = await import("@/lib/originality/semantic/analyse-document");

const LONG = Array.from({ length: 20 }, (_, i) => `palabra${i}`).join(" ");
const makeChunks = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, text: LONG, normalizedText: LONG }));

beforeEach(() => {
  getEmbeddingProvider.mockReset().mockReturnValue({
    metadata: { provider: "openai", model: "text-embedding-3-small", version: "v1", dimensions: 1536, maxBatchSize: 32 },
    embed: vi.fn(),
  });
  embedChunks.mockReset().mockImplementation(async (_p, chunks: { id: number }[]) => ({
    embeddings: chunks.map((c) => ({ chunkId: c.id, vector: new Array(1536).fill(0.01) })),
    skippedChunkIds: [],
    providerCallCount: chunks.length,
  }));
});

describe("embedding cost ceiling", () => {
  it("embeds every chunk of an ordinary document", async () => {
    const result = await analyseSemantically(makeChunks(40), []);
    expect(embedChunks.mock.calls[0][1]).toHaveLength(40);
    expect(result.truncated).toBe(false);
  });

  it("stops at the ceiling for an oversized document", async () => {
    await analyseSemantically(makeChunks(MAX_CHUNKS_PER_DOCUMENT + 500), []);
    expect(embedChunks.mock.calls[0][1]).toHaveLength(MAX_CHUNKS_PER_DOCUMENT);
  });

  it("reports the pass as truncated instead of pretending it was complete", async () => {
    // Silently analysing part of a document and presenting the result as
    // whole-document coverage would be the dishonest failure mode.
    const result = await analyseSemantically(makeChunks(MAX_CHUNKS_PER_DOCUMENT + 1), []);
    expect(result.truncated).toBe(true);
  });

  it("does not truncate exactly at the ceiling", async () => {
    const result = await analyseSemantically(makeChunks(MAX_CHUNKS_PER_DOCUMENT), []);
    expect(result.truncated).toBe(false);
    expect(embedChunks.mock.calls[0][1]).toHaveLength(MAX_CHUNKS_PER_DOCUMENT);
  });

  it("never calls the provider when none is configured", async () => {
    // The cheapest possible analysis: no provider, no spend.
    getEmbeddingProvider.mockReturnValue(null);
    const result = await analyseSemantically(makeChunks(1000), []);
    expect(embedChunks).not.toHaveBeenCalled();
    expect(result.embeddingsGenerated).toBe(0);
    expect(result.unavailableReason).toBe("no_provider_configured");
  });

  it("spends nothing on a document with no chunk worth embedding", async () => {
    const result = await analyseSemantically([{ id: 1, text: "Corto", normalizedText: "corto" }], []);
    expect(embedChunks).not.toHaveBeenCalled();
    expect(result.unavailableReason).toBe("no_chunk_long_enough");
  });

  it("degrades to lexical-only when the provider throws, without retrying forever", async () => {
    embedChunks.mockRejectedValue(new Error("429 rate limited"));
    const result = await analyseSemantically(makeChunks(10), []);
    expect(result.unavailableReason).toMatch(/provider_error/);
    expect(result.embeddings).toEqual([]);
    expect(embedChunks).toHaveBeenCalledTimes(1);
  });
});
