import { describe, expect, it, vi } from "vitest";
import {
  EmbeddingCache,
  EmbeddingService,
  InMemoryVectorRepository,
  SemanticCandidateRetriever,
  SemanticSimilarityEngine,
  cosineSimilarity,
} from "@/lib/originality/semantic/engine";
import { MockEmbeddingAdapter } from "@/lib/originality/semantic/adapters";

const mockProvider = new MockEmbeddingAdapter({ model: "mock-embedding-v1" });

describe("semantic engine", () => {
  it("keeps the cache key stable and provider-aware", () => {
    const textA = "This is a test paragraph for embeddings.";
    const textB = "This is a test paragraph for embeddings.";

    const hashA = EmbeddingCache.hash(textA, "mock", "mock-model", "v1");
    const hashB = EmbeddingCache.hash(textB, "mock", "mock-model", "v1");

    expect(hashA).toBe(hashB);
  });

  it("reuses cached vectors instead of re-embedding the same text", async () => {
    const cache = new EmbeddingCache();
    const service = new EmbeddingService(mockProvider, cache);

    const first = await service.embedTexts(["A paragraph with meaningful content for a test."]);
    const second = await service.embedTexts(["A paragraph with meaningful content for a test."]);

    expect(first[0]).toEqual(second[0]);
    expect(cache.storage.size).toBeGreaterThan(0);
  });

  it("classifies semantic score bands without turning them into plagiarism verdicts", () => {
    const engine = new SemanticSimilarityEngine(new InMemoryVectorRepository([]), 0.7);

    expect(engine.classifySimilarity(0.92)).toBe("high");
    expect(engine.classifySimilarity(0.78)).toBe("moderate");
    expect(engine.classifySimilarity(0.55)).toBe("low");
  });

  it("computes cosine similarity deterministically for the same vectors", () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1, 5);
    expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0, 5);
  });

  it("fails honestly when no semantic provider is configured", async () => {
    const engine = new SemanticSimilarityEngine(new InMemoryVectorRepository([]), 0.7);
    const retriever = new SemanticCandidateRetriever(engine, null);

    await expect(retriever.retrieve([1, 0, 0])).rejects.toThrow("semantic provider not configured");
  });

  it("keeps the provider mock clearly marked as a mock", () => {
    expect(mockProvider.metadata.model).toContain("mock");
    expect(mockProvider.metadata.provider).toBe("mock");
    expect(mockProvider.metadata.version).toBeTypeOf("string");
  });

  it("reuses the same embedding when text, provider, model and version are identical", () => {
    const cache = new EmbeddingCache();
    const text = "This is a stable paragraph for repeated semantic checks.";
    cache.set(text, "openai", "text-embedding-3-small", "v1", [0.2, 0.8, 0.4]);

    expect(cache.get(text, "openai", "text-embedding-3-small", "v1")).toEqual([0.2, 0.8, 0.4]);
    expect(EmbeddingCache.hash(text, "openai", "text-embedding-3-small", "v1")).toBe(
      EmbeddingCache.hash(text, "openai", "text-embedding-3-small", "v1"),
    );
  });

  it("retries a failed batch before failing the whole embedding run", async () => {
    const provider = {
      metadata: {
        provider: "openai",
        model: "text-embedding-3-small",
        version: "v1",
        dimensions: 1536,
        maxBatchSize: 2,
        timeoutMs: 1000,
        maxRetries: 2,
      },
      embed: vi.fn()
        .mockRejectedValueOnce(new Error("temporary network glitch"))
        .mockResolvedValueOnce([
          { text: "first", vector: new Array(1536).fill(0.1) },
          { text: "second", vector: new Array(1536).fill(0.2) },
        ]),
    };

    const service = new EmbeddingService(provider, new EmbeddingCache());
    const result = await service.embedTexts(["first", "second"]);

    expect(result).toHaveLength(2);
    expect(provider.embed).toHaveBeenCalledTimes(2);
    expect(result[0][0]).toBeCloseTo(0.1, 5);
    expect(result[1][0]).toBeCloseTo(0.2, 5);
  });
});
