import "server-only";

export interface EmbeddingModelMetadata {
  /** Provider family, so a model change is still known to be OpenAI/Cohere/Voyage/mock. */
  readonly provider?: "mock" | "openai" | "cohere" | "voyage" | string;
  /** Stable identifier stored alongside every vector, so a model change never silently mixes incompatible embeddings. */
  readonly model: string;
  /** Model version in the same format the provider expects, e.g. `v1`, `text-embedding-3-small`. */
  readonly version?: string;
  readonly dimensions: number;
  /** Hard cap per API call; the batcher never exceeds it. */
  readonly maxBatchSize: number;
  readonly timeoutMs?: number;
  readonly maxRetries?: number;
}

export interface EmbeddingResult {
  text: string;
  vector: number[];
}

export interface EmbeddingProvider {
  readonly metadata: EmbeddingModelMetadata;
  /** Embeds a batch. Implementations must return results in the SAME order as the input. */
  embed(texts: string[]): Promise<EmbeddingResult[]>;
}

export class SemanticProviderNotConfiguredError extends Error {
  constructor() {
    super("semantic provider not configured");
    this.name = "SemanticProviderNotConfiguredError";
  }
}

export class MockEmbeddingProvider implements EmbeddingProvider {
  readonly metadata: EmbeddingModelMetadata;

  constructor(
    model = "mock-embedding-v1",
    dimensions = STORED_EMBEDDING_DIMENSIONS,
    maxBatchSize = 8,
    provider: EmbeddingModelMetadata["provider"] = "mock",
    version = "v1",
  ) {
    this.metadata = { provider, model, version, dimensions, maxBatchSize };
  }

  async embed(texts: string[]): Promise<EmbeddingResult[]> {
    return texts.map((text) => ({
      text,
      vector: Array.from({ length: STORED_EMBEDDING_DIMENSIONS }, (_, index) => {
        const seed = text.length + index;
        return ((seed % 13) / 13) * 0.5 + 0.1;
      }),
    }));
  }
}

/**
 * The dimension the `document_chunk_embeddings.embedding` column is
 * declared with (see 0007_semantic_embeddings.sql). A provider whose
 * model doesn't match this cannot be stored without its own migration —
 * mixing dimensionalities would silently produce meaningless similarity
 * scores rather than an error, so this is enforced explicitly.
 */
export const STORED_EMBEDDING_DIMENSIONS = 1536;

export class EmbeddingDimensionMismatchError extends Error {
  constructor(model: string, actual: number) {
    super(
      `El modelo "${model}" produce vectores de ${actual} dimensiones, pero la tabla almacena ${STORED_EMBEDDING_DIMENSIONS}. ` +
        `Añade una migración para ese tamaño antes de usarlo.`,
    );
    this.name = "EmbeddingDimensionMismatchError";
  }
}
