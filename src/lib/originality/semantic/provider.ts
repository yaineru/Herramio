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

/** Provider names that have a REAL adapter implemented. Empty until one is written. */
const IMPLEMENTED_PROVIDERS: readonly string[] = [];

/**
 * Resolves the configured embedding provider, or null when semantic
 * analysis is genuinely unavailable.
 *
 * Two rules this function exists to enforce, both of which were violated
 * by an earlier version that returned a `MockEmbeddingProvider` labelled
 * `openai-text-embedding-3-small` whenever an API key was present:
 *
 *  1. The mock NEVER stands in for a real provider. Its vectors are
 *     deterministic nonsense derived from string length — similarity
 *     computed from them is meaningless. Returning it under a real
 *     model's name would put fabricated numbers in front of a user who
 *     is deciding whether someone plagiarised, and would persist those
 *     vectors into `document_chunk_embeddings` under a real model name,
 *     silently poisoning the corpus for the day a real adapter IS
 *     connected.
 *  2. The mock never activates in production, even if explicitly asked
 *     for — a stray env var must not be able to turn fake analysis on
 *     for real users.
 *
 * Naming a provider with no adapter yet returns null and logs why, which
 * surfaces as an honest "semantic analysis unavailable" in the report.
 */
export function buildEmbeddingProviderFromEnv(): EmbeddingProvider | null {
  const provider = (process.env.EMBEDDING_PROVIDER ?? "").trim().toLowerCase();
  if (!provider) return null;

  if (provider === "mock") {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "EMBEDDING_PROVIDER=mock ignorado en producción: el proveedor mock genera vectores falsos y nunca debe " +
          "producir resultados que un usuario pueda interpretar como reales.",
      );
      return null;
    }
    return new MockEmbeddingProvider();
  }

  if (!IMPLEMENTED_PROVIDERS.includes(provider)) {
    console.warn(
      `EMBEDDING_PROVIDER="${provider}" no tiene un adaptador real implementado todavía. ` +
        `El análisis semántico permanece desactivado (no se inventan embeddings). Ver ORIGINALITY.md.`,
    );
    return null;
  }

  // Unreachable while IMPLEMENTED_PROVIDERS is empty. A real adapter is
  // constructed here — and only here — once written.
  return null;
}

export class EmbeddingDimensionMismatchError extends Error {
  constructor(model: string, actual: number) {
    super(
      `El modelo "${model}" produce vectores de ${actual} dimensiones, pero la tabla almacena ${STORED_EMBEDDING_DIMENSIONS}. ` +
        `Añade una migración para ese tamaño antes de usarlo.`,
    );
    this.name = "EmbeddingDimensionMismatchError";
  }
}

/**
 * Returns the configured embedding provider, or null when none is set up.
 *
 * Null is a first-class, expected state — not an error. Callers MUST
 * treat it as "semantic analysis unavailable" and say so in the report,
 * never substitute a fabricated similarity score. No provider is
 * configured today: connecting one means implementing `EmbeddingProvider`
 * here and supplying its API key. See ORIGINALITY.md.
 */
export function getEmbeddingProvider(): EmbeddingProvider | null {
  return buildEmbeddingProviderFromEnv();
}

export function requireEmbeddingProvider(): EmbeddingProvider {
  const provider = getEmbeddingProvider();
  if (!provider) {
    throw new SemanticProviderNotConfiguredError();
  }
  return provider;
}

export function isSemanticAnalysisAvailable(): boolean {
  return getEmbeddingProvider() !== null;
}
