import { describe, it, expect, vi, afterEach } from "vitest";
import { embedChunks, isWorthEmbedding, cacheKey } from "@/lib/originality/semantic/embed-chunks";
import {
  getEmbeddingProvider,
  isSemanticAnalysisAvailable,
  STORED_EMBEDDING_DIMENSIONS,
  type EmbeddingProvider,
} from "@/lib/originality/semantic/provider";

function makeMockProvider(overrides: Partial<EmbeddingProvider["metadata"]> = {}): {
  provider: EmbeddingProvider;
  embedSpy: ReturnType<typeof vi.fn>;
} {
  const embedSpy = vi.fn(async (texts: string[]) =>
    texts.map((text) => ({ text, vector: new Array(STORED_EMBEDDING_DIMENSIONS).fill(0.1) })),
  );
  return {
    embedSpy,
    provider: {
      metadata: { model: "mock-v1", dimensions: STORED_EMBEDDING_DIMENSIONS, maxBatchSize: 2, ...overrides },
      embed: embedSpy,
    },
  };
}

function chunk(id: number, text: string) {
  return { id, text, normalizedText: text.toLowerCase() };
}

const LONG = "this chunk has clearly more than twelve words in it so it qualifies for embedding easily";

describe("semantic provider configuration — anti-fabrication guarantees", () => {
  const originalProvider = process.env.EMBEDDING_PROVIDER;
  const originalKey = process.env.EMBEDDING_PROVIDER_API_KEY;
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.EMBEDDING_PROVIDER = originalProvider;
    process.env.EMBEDDING_PROVIDER_API_KEY = originalKey;
    vi.stubEnv("NODE_ENV", originalNodeEnv as string);
  });

  it("NEVER returns a mock dressed up as a real provider when an API key is present", () => {
    // Regression test for a real bug: naming a real provider with any API
    // key used to return a MockEmbeddingProvider labelled
    // "openai-text-embedding-3-small". That would have shown fabricated
    // similarity to a user judging plagiarism AND persisted junk vectors
    // into document_chunk_embeddings under a real model name, poisoning
    // the corpus for whenever a genuine adapter is finally connected.
    for (const name of ["openai", "cohere", "voyage"]) {
      process.env.EMBEDDING_PROVIDER = name;
      process.env.EMBEDDING_PROVIDER_API_KEY = "sk-looks-real-but-unused";
      const provider = getEmbeddingProvider();
      expect(provider, `${name} must not resolve to a fake provider`).toBeNull();
    }
  });

  it("refuses to enable the mock provider in production even when explicitly configured", () => {
    process.env.EMBEDDING_PROVIDER = "mock";
    vi.stubEnv("NODE_ENV", "production" as string);
    expect(getEmbeddingProvider()).toBeNull();
    expect(isSemanticAnalysisAvailable()).toBe(false);
  });

  it("allows the mock provider outside production, clearly labelled as mock", () => {
    process.env.EMBEDDING_PROVIDER = "mock";
    vi.stubEnv("NODE_ENV", "test" as string);
    const provider = getEmbeddingProvider();
    expect(provider).not.toBeNull();
    expect(provider!.metadata.provider).toBe("mock");
    // The model name must never impersonate a real vendor model.
    expect(provider!.metadata.model).toContain("mock");
  });

  it("returns null when no semantic provider is configured, which is the honest default", () => {
    delete process.env.EMBEDDING_PROVIDER;
    expect(getEmbeddingProvider()).toBeNull();
    expect(isSemanticAnalysisAvailable()).toBe(false);
  });
});

describe("isWorthEmbedding", () => {
  it("rejects short headings that would waste quota and pollute vector space", () => {
    expect(isWorthEmbedding({ text: "Introduction" })).toBe(false);
    expect(isWorthEmbedding({ text: "Results and discussion" })).toBe(false);
  });

  it("accepts a substantive paragraph", () => {
    expect(isWorthEmbedding({ text: LONG })).toBe(true);
  });
});

describe("embedChunks", () => {
  it("skips short chunks and reports them rather than silently dropping them", async () => {
    const { provider } = makeMockProvider();
    const result = await embedChunks(provider, [chunk(1, "Introduction"), chunk(2, LONG)]);

    expect(result.skippedChunkIds).toEqual([1]);
    expect(result.embeddings.map((e) => e.chunkId)).toEqual([2]);
  });

  it("batches according to the provider's maxBatchSize", async () => {
    const { provider, embedSpy } = makeMockProvider({ maxBatchSize: 2 });
    await embedChunks(provider, [chunk(1, LONG), chunk(2, LONG + " a"), chunk(3, LONG + " b")]);

    // 3 chunks, batch size 2 → 2 calls (2 + 1), never one oversized call.
    expect(embedSpy).toHaveBeenCalledTimes(2);
    expect(embedSpy.mock.calls[0][0]).toHaveLength(2);
    expect(embedSpy.mock.calls[1][0]).toHaveLength(1);
  });

  it("reuses cached vectors instead of re-requesting them (the main cost control)", async () => {
    const { provider, embedSpy } = makeMockProvider();
    const cache = new Map<string, number[]>();
    cache.set(cacheKey(LONG.toLowerCase(), "mock-v1"), new Array(STORED_EMBEDDING_DIMENSIONS).fill(0.5));

    const result = await embedChunks(provider, [chunk(1, LONG)], cache);

    expect(embedSpy).not.toHaveBeenCalled();
    expect(result.providerCallCount).toBe(0);
    expect(result.embeddings[0].vector[0]).toBe(0.5);
  });

  it("populates the cache so a repeated passage costs one embedding, not two", async () => {
    const { provider, embedSpy } = makeMockProvider();
    const cache = new Map<string, number[]>();

    await embedChunks(provider, [chunk(1, LONG)], cache);
    await embedChunks(provider, [chunk(2, LONG)], cache);

    expect(embedSpy).toHaveBeenCalledTimes(1);
  });

  it("counts only real provider calls for cost tracking", async () => {
    const { provider } = makeMockProvider();
    const result = await embedChunks(provider, [chunk(1, LONG), chunk(2, "short")]);
    expect(result.providerCallCount).toBe(1);
  });

  it("refuses a provider whose dimensions don't match the storage column", async () => {
    const { provider } = makeMockProvider({ dimensions: 768 });
    await expect(embedChunks(provider, [chunk(1, LONG)])).rejects.toThrow(/768.*1536|dimensiones/);
  });

  it("throws if the provider returns a different number of vectors than texts (order/count must be exact)", async () => {
    const provider: EmbeddingProvider = {
      metadata: { model: "bad", dimensions: STORED_EMBEDDING_DIMENSIONS, maxBatchSize: 10 },
      embed: async () => [],
    };
    await expect(embedChunks(provider, [chunk(1, LONG)])).rejects.toThrow(/orden y la cantidad/);
  });
});
