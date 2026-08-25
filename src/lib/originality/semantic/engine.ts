import crypto from "node:crypto";
import type { EmbeddingProvider, EmbeddingResult } from "@/lib/originality/semantic/provider";

export type SemanticThreshold = "low" | "moderate" | "high";

export interface CandidateChunk {
  id: number;
  documentId: string;
  text: string;
  normalizedText: string;
}

export interface SemanticCandidate {
  chunkId: number;
  documentId: string;
  similarity: number;
  threshold: SemanticThreshold;
  sourceConfidence: "low" | "medium" | "high";
}

export interface VectorRepository {
  findNearest(embedding: number[], limit?: number, excludeDocumentId?: string): Promise<SemanticCandidate[]>;
}

export interface EmbeddingBatchOptions {
  limit?: number;
  excludeDocumentId?: string;
}

export class EmbeddingCache {
  readonly storage = new Map<string, number[]>();

  static hash(text: string, provider: string, model: string, version: string): string {
    return crypto.createHash("sha256").update(`${provider}:${model}:${version}:${text}`).digest("hex");
  }

  get(text: string, provider: string, model: string, version: string): number[] | undefined {
    return this.storage.get(EmbeddingCache.hash(text, provider, model, version));
  }

  set(text: string, provider: string, model: string, version: string, vector: number[]): void {
    this.storage.set(EmbeddingCache.hash(text, provider, model, version), vector);
  }
}

export class EmbeddingService {
  constructor(
    private readonly provider: EmbeddingProvider,
    private readonly cache: EmbeddingCache = new EmbeddingCache(),
  ) {}

  async embedTexts(texts: string[]): Promise<number[][]> {
    const providerKey = this.provider.metadata.provider ?? "mock";
    const modelKey = this.provider.metadata.model;
    const versionKey = this.provider.metadata.version ?? "v1";
    const cacheHits: number[][] = [];
    const pending: { index: number; text: string }[] = [];

    for (const [index, text] of texts.entries()) {
      const cached = this.cache.get(text, providerKey, modelKey, versionKey);
      if (cached) {
        cacheHits[index] = cached;
      } else {
        pending.push({ index, text });
      }
    }

    if (pending.length === 0) {
      return texts.map((_, index) => cacheHits[index] ?? []);
    }

    const batchSize = this.provider.metadata.maxBatchSize ?? 32;
    const results: (EmbeddingResult | undefined)[] = [];

    for (let i = 0; i < pending.length; i += batchSize) {
      const batch = pending.slice(i, i + batchSize).map((p) => p.text);
      let response: EmbeddingResult[] = [];
      let lastError: unknown;
      const maxRetries = this.provider.metadata.maxRetries ?? 2;

      for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
        try {
          response = await this.provider.embed(batch);
          if (response.length !== batch.length) {
            throw new Error("Embedding provider returned an unexpected number of vectors for the requested batch.");
          }
          lastError = undefined;
          break;
        } catch (error) {
          lastError = error;
          if (attempt >= maxRetries) {
            throw error;
          }
        }
      }

      if (lastError !== undefined && response.length === 0) {
        throw lastError;
      }

      for (let j = 0; j < response.length; j++) {
        const item = response[j];
        const target = pending[i + j];
        this.cache.set(target.text, providerKey, modelKey, versionKey, item.vector);
        results[target.index] = item;
      }
    }

    return texts.map((_, index) => {
      const item = results[index];
      if (item) return item.vector;
      return cacheHits[index] ?? [];
    });
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class InMemoryVectorRepository implements VectorRepository {
  constructor(private readonly records: Array<{ chunkId: number; documentId: string; vector: number[] }>) {}

  async findNearest(embedding: number[], limit = 20, excludeDocumentId?: string): Promise<SemanticCandidate[]> {
    const candidates: SemanticCandidate[] = [];

    for (const record of this.records) {
      if (excludeDocumentId && record.documentId === excludeDocumentId) continue;
      const similarity = cosineSimilarity(embedding, record.vector);
      candidates.push({
        chunkId: record.chunkId,
        documentId: record.documentId,
        similarity,
        threshold: classifySemanticThreshold(similarity),
        sourceConfidence: similarity >= 0.8 ? "high" : similarity >= 0.6 ? "medium" : "low",
      });
    }

    return candidates.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
  }
}

export class SemanticSimilarityEngine {
  constructor(
    private readonly repository: VectorRepository,
    private readonly minimumSimilarity = 0.72,
  ) {}

  async retrieveCandidates(embedding: number[], options: EmbeddingBatchOptions = {}): Promise<SemanticCandidate[]> {
    const candidates = await this.repository.findNearest(embedding, options.limit ?? 20, options.excludeDocumentId);
    return candidates.filter((candidate) => candidate.similarity >= this.minimumSimilarity);
  }

  classifySimilarity(similarity: number): SemanticThreshold {
    return classifySemanticThreshold(similarity);
  }
}

export function classifySemanticThreshold(similarity: number): SemanticThreshold {
  if (similarity >= 0.85) return "high";
  if (similarity >= 0.7) return "moderate";
  return "low";
}

export class SemanticCandidateRetriever {
  constructor(
    private readonly engine: SemanticSimilarityEngine,
    private readonly provider: EmbeddingProvider | null,
  ) {}

  async retrieve(embedding: number[], options: EmbeddingBatchOptions = {}): Promise<SemanticCandidate[]> {
    if (!this.provider) {
      throw new Error("semantic provider not configured");
    }
    return this.engine.retrieveCandidates(embedding, options);
  }
}
