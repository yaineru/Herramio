import { describe, it, expect, vi, afterEach } from "vitest";
import { embedChunks, isWorthEmbedding } from "@/lib/originality/semantic/embed-chunks";
import { EmbeddingCache } from "@/lib/originality/semantic/engine";
import { STORED_EMBEDDING_DIMENSIONS, type EmbeddingProvider } from "@/lib/originality/semantic/provider";
import { getEmbeddingProvider, isSemanticAnalysisAvailable } from "@/lib/originality/semantic/resolve";

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

  it("resolves openai to the REAL adapter, never to a mock wearing its name", () => {
    // Regression test for a real bug: naming a real provider with any API
    // key used to return a MockEmbeddingProvider labelled
    // "openai-text-embedding-3-small". That would have shown fabricated
    // similarity to a user judging plagiarism AND persisted junk vectors
    // into document_chunk_embeddings under a real model name, poisoning
    // the corpus for whenever a genuine adapter was finally connected.
    //
    // Now that OpenAI IS implemented the assertion inverts: it must
    // resolve, and what it resolves to must be the real adapter. The
    // property being protected is the same one — the thing behind a real
    // provider name is never fake.
    process.env.EMBEDDING_PROVIDER = "openai";
    process.env.EMBEDDING_PROVIDER_API_KEY = "sk-looks-real-but-unused";
    const provider = getEmbeddingProvider();

    expect(provider).not.toBeNull();
    expect(provider!.constructor.name).toBe("OpenAIEmbeddingAdapter");
    expect(provider!.metadata.provider).toBe("openai");
    expect(provider!.metadata.model).toBe("text-embedding-3-small");
    expect(provider!.metadata.model).not.toContain("mock");
    // Must match the column the vectors are stored in, or persistence
    // would silently mix dimensionalities.
    expect(provider!.metadata.dimensions).toBe(1536);
  });

  it("returns null for a provider that is named but has no adapter yet", () => {
    // Cohere and Voyage have prepared classes that throw rather than
    // embed. Resolution must not hand one of those out as if semantic
    // analysis were available — the report would then fail mid-analysis
    // instead of honestly reporting the capability as off.
    for (const name of ["cohere", "voyage", "somethingelse"]) {
      process.env.EMBEDDING_PROVIDER = name;
      process.env.EMBEDDING_PROVIDER_API_KEY = "sk-looks-real-but-unused";
      expect(getEmbeddingProvider(), `${name} has no adapter and must resolve to null`).toBeNull();
    }
  });

  it("returns null when the provider is configured but the key is missing", () => {
    // A configured provider with no credential is "unavailable". It must
    // never be a reason to fall back to the mock.
    process.env.EMBEDDING_PROVIDER = "openai";
    delete process.env.EMBEDDING_PROVIDER_API_KEY;
    delete process.env.OPENAI_API_KEY;
    expect(getEmbeddingProvider()).toBeNull();
    expect(isSemanticAnalysisAvailable()).toBe(false);
  });

  it("accepts the key under OPENAI_API_KEY as well as the generic name", () => {
    // OpenAI's own convention is OPENAI_API_KEY. A key arriving under the
    // obvious name and being silently ignored is a worse failure than
    // supporting two spellings.
    process.env.EMBEDDING_PROVIDER = "openai";
    delete process.env.EMBEDDING_PROVIDER_API_KEY;
    process.env.OPENAI_API_KEY = "sk-looks-real-but-unused";
    expect(getEmbeddingProvider()).not.toBeNull();
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
    const cache = new EmbeddingCache();
    cache.set(LONG.toLowerCase(), "unknown", "mock-v1", "v1", new Array(STORED_EMBEDDING_DIMENSIONS).fill(0.5));

    const result = await embedChunks(provider, [chunk(1, LONG)], cache);

    expect(embedSpy).not.toHaveBeenCalled();
    expect(result.providerCallCount).toBe(0);
    expect(result.embeddings[0].vector[0]).toBe(0.5);
  });

  it("populates the cache so a repeated passage costs one embedding, not two", async () => {
    const { provider, embedSpy } = makeMockProvider();
    const cache = new EmbeddingCache();

    await embedChunks(provider, [chunk(1, LONG)], cache);
    await embedChunks(provider, [chunk(2, LONG)], cache);

    expect(embedSpy).toHaveBeenCalledTimes(1);
  });

  it("does not serve a cached vector across providers sharing a model name", async () => {
    // Two providers can expose the same model id, and a model can be
    // revised in place. Keying on the model alone would hand back a vector
    // generated by a different engine, silently corrupting every
    // similarity computed from it.
    const cache = new EmbeddingCache();
    cache.set(LONG.toLowerCase(), "openai", "shared-name", "v1", new Array(STORED_EMBEDDING_DIMENSIONS).fill(0.5));

    const { provider, embedSpy } = makeMockProvider({ provider: "cohere", model: "shared-name", version: "v1" });
    const result = await embedChunks(provider, [chunk(1, LONG)], cache);

    expect(embedSpy).toHaveBeenCalledTimes(1);
    expect(result.embeddings[0].vector[0]).toBe(0.1);
  });

  it("does not serve a cached vector across versions of the same model", async () => {
    const cache = new EmbeddingCache();
    cache.set(LONG.toLowerCase(), "cohere", "same-model", "v1", new Array(STORED_EMBEDDING_DIMENSIONS).fill(0.5));

    const { provider, embedSpy } = makeMockProvider({ provider: "cohere", model: "same-model", version: "v2" });
    await embedChunks(provider, [chunk(1, LONG)], cache);

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
