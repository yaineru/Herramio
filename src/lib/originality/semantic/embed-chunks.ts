import "server-only";
import {
  EmbeddingDimensionMismatchError,
  STORED_EMBEDDING_DIMENSIONS,
  type EmbeddingProvider,
  type EmbeddingResult,
} from "@/lib/originality/semantic/provider";

// A chunk shorter than this carries no distinctive meaning — headings,
// section labels, stray lines. Embedding them wastes provider quota AND
// pollutes results, because short generic strings sit close to everything
// in vector space. Same reasoning as the containment size guard in the
// lexical engine.
const MIN_WORDS_FOR_EMBEDDING = 12;

export interface EmbeddableChunk {
  id: number;
  text: string;
  normalizedText: string;
}

export function isWorthEmbedding(chunk: { text: string }): boolean {
  const words = chunk.text.trim().split(/\s+/).filter(Boolean);
  return words.length >= MIN_WORDS_FOR_EMBEDDING;
}

export interface EmbedChunksResult {
  embeddings: { chunkId: number; vector: number[] }[];
  /** Chunks skipped as too short to be meaningful — reported, never silently dropped. */
  skippedChunkIds: number[];
  /** How many vectors were actually requested from the provider (cache hits excluded). Feeds cost tracking. */
  providerCallCount: number;
}

/**
 * Embeds the chunks worth embedding, in provider-sized batches, reusing
 * anything already present in `cache`.
 *
 * The cache is keyed on normalized text + model, so re-analyzing an
 * unchanged document — or two documents sharing a passage — costs one
 * embedding, not several. That matters because embeddings are the main
 * per-analysis cost once a provider is connected.
 */
export async function embedChunks(
  provider: EmbeddingProvider,
  chunks: EmbeddableChunk[],
  cache: Map<string, number[]> = new Map(),
): Promise<EmbedChunksResult> {
  const { model, dimensions, maxBatchSize } = provider.metadata;
  if (dimensions !== STORED_EMBEDDING_DIMENSIONS) {
    throw new EmbeddingDimensionMismatchError(model, dimensions);
  }

  const embeddings: { chunkId: number; vector: number[] }[] = [];
  const skippedChunkIds: number[] = [];
  const pending: EmbeddableChunk[] = [];

  for (const chunk of chunks) {
    if (!isWorthEmbedding(chunk)) {
      skippedChunkIds.push(chunk.id);
      continue;
    }
    const cached = cache.get(cacheKey(chunk.normalizedText, model));
    if (cached) {
      embeddings.push({ chunkId: chunk.id, vector: cached });
      continue;
    }
    pending.push(chunk);
  }

  let providerCallCount = 0;
  for (let i = 0; i < pending.length; i += maxBatchSize) {
    const batch = pending.slice(i, i + maxBatchSize);
    const results = await provider.embed(batch.map((c) => c.normalizedText));
    if (results.length !== batch.length) {
      throw new Error(
        `El proveedor de embeddings devolvió ${results.length} vectores para ${batch.length} textos. ` +
          `El orden y la cantidad deben coincidir exactamente.`,
      );
    }
    providerCallCount += batch.length;

    batch.forEach((chunk, idx) => {
      const vector = assertDimensions(results[idx], model);
      cache.set(cacheKey(chunk.normalizedText, model), vector);
      embeddings.push({ chunkId: chunk.id, vector });
    });
  }

  return { embeddings, skippedChunkIds, providerCallCount };
}

function assertDimensions(result: EmbeddingResult, model: string): number[] {
  if (result.vector.length !== STORED_EMBEDDING_DIMENSIONS) {
    throw new EmbeddingDimensionMismatchError(model, result.vector.length);
  }
  return result.vector;
}

export function cacheKey(normalizedText: string, model: string): string {
  return `${model}::${normalizedText}`;
}
