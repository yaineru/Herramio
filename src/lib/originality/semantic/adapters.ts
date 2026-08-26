import {
  EmbeddingModelMetadata,
  EmbeddingProvider,
  EmbeddingResult,
  STORED_EMBEDDING_DIMENSIONS,
  SemanticProviderNotConfiguredError,
} from "@/lib/originality/semantic/provider";

export interface EmbeddingProviderConfig {
  apiKey?: string;
  provider?: EmbeddingModelMetadata["provider"];
  model: string;
  version?: string;
  dimensions?: number;
  batchSize?: number;
  timeoutMs?: number;
  maxRetries?: number;
}

export abstract class BaseEmbeddingAdapter implements EmbeddingProvider {
  readonly metadata: EmbeddingModelMetadata;

  constructor(config: EmbeddingProviderConfig) {
    this.metadata = {
      provider: config.provider ?? "mock",
      model: config.model,
      version: config.version ?? "v1",
      dimensions: config.dimensions ?? STORED_EMBEDDING_DIMENSIONS,
      maxBatchSize: config.batchSize ?? 32,
      timeoutMs: config.timeoutMs ?? 10000,
      maxRetries: config.maxRetries ?? 2,
    };
  }

  abstract embed(texts: string[]): Promise<EmbeddingResult[]>;

  protected requireApiKey(name: string, apiKey?: string): string {
    if (!apiKey) {
      throw new SemanticProviderNotConfiguredError();
    }
    return apiKey;
  }
}

export class MockEmbeddingAdapter extends BaseEmbeddingAdapter {
  constructor(config: Partial<EmbeddingProviderConfig> = {}) {
    super({
      provider: config.provider ?? "mock",
      model: config.model ?? "mock-embedding-v1",
      version: config.version ?? "v1",
      dimensions: config.dimensions ?? STORED_EMBEDDING_DIMENSIONS,
      batchSize: config.batchSize ?? 8,
      apiKey: config.apiKey,
      timeoutMs: config.timeoutMs ?? 1000,
      maxRetries: config.maxRetries ?? 1,
    });
  }

  async embed(texts: string[]): Promise<EmbeddingResult[]> {
    return texts.map((text, index) => ({
      text,
      vector: Array.from({ length: this.metadata.dimensions }, (_, valueIndex) => {
        const seed = text.length + index + valueIndex;
        return (seed % 17) / 17;
      }),
    }));
  }
}

export class OpenAIEmbeddingAdapter extends BaseEmbeddingAdapter {
  readonly config: EmbeddingProviderConfig;

  constructor(config: EmbeddingProviderConfig) {
    super({
      ...config,
      provider: "openai",
      model: config.model ?? "text-embedding-3-small",
      version: config.version ?? "v1",
      batchSize: config.batchSize ?? 32,
      timeoutMs: config.timeoutMs ?? 10000,
      maxRetries: config.maxRetries ?? 2,
    });
    this.config = { ...config, provider: "openai", model: config.model ?? "text-embedding-3-small", version: config.version ?? "v1" };
  }

  async embed(texts: string[]): Promise<EmbeddingResult[]> {
    const apiKey = this.requireApiKey("OpenAI", this.config.apiKey);
    const url = "https://api.openai.com/v1/embeddings";
    const payload = { input: texts, model: this.config.model, encoding_format: "float" };

    const response = await this.fetchWithRetry(url, apiKey, payload);
    const items = Array.isArray(response?.data) ? response.data : [];
    if (!Array.isArray(items) || items.length !== texts.length) {
      throw new Error(
        `OpenAI embedding batch returned ${items.length ?? 0} vectors for ${texts.length} inputs. Retry and partial-failure handling are required before accepting the result.`,
      );
    }

    return items.map((item: { embedding?: number[] }, index: number) => ({
      text: texts[index],
      vector: Array.isArray(item?.embedding) ? item.embedding : [],
    }));
  }

  private async fetchWithRetry(
    url: string,
    apiKey: string,
    payload: Record<string, unknown>,
  ): Promise<{ data?: Array<{ embedding?: number[] }> }> {
    let lastError: unknown;
    const maxRetries = this.metadata.maxRetries ?? 2;
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(this.metadata.timeoutMs ?? 10000),
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(`OpenAI HTTP ${response.status}: ${message}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error;
        if (attempt >= maxRetries) {
          break;
        }
      }
    }

    throw new Error(`OpenAI embedding request failed after retries: ${String(lastError)}`);
  }
}

export class CohereEmbeddingAdapter extends BaseEmbeddingAdapter {
  readonly config: EmbeddingProviderConfig;

  constructor(config: EmbeddingProviderConfig) {
    super({
      ...config,
      provider: "cohere",
      model: config.model ?? "embed-v3.0",
      version: config.version ?? "v3",
      batchSize: config.batchSize ?? 16,
      timeoutMs: config.timeoutMs ?? 10000,
      maxRetries: config.maxRetries ?? 2,
    });
    this.config = { ...config, provider: "cohere", model: config.model ?? "embed-v3.0", version: config.version ?? "v3" };
  }

  // Param intentionally omitted: this adapter throws rather than embed, so
  // there is nothing to consume. It never silently returns fake vectors.
  async embed(): Promise<EmbeddingResult[]> {
    this.requireApiKey("Cohere", this.config.apiKey);
    throw new Error("Cohere provider adapter is prepared but no real API credential is configured in this environment.");
  }
}

export class VoyageEmbeddingAdapter extends BaseEmbeddingAdapter {
  readonly config: EmbeddingProviderConfig;

  constructor(config: EmbeddingProviderConfig) {
    super({
      ...config,
      provider: "voyage",
      model: config.model ?? "voyage-3",
      version: config.version ?? "v1",
      batchSize: config.batchSize ?? 16,
      timeoutMs: config.timeoutMs ?? 10000,
      maxRetries: config.maxRetries ?? 2,
    });
    this.config = { ...config, provider: "voyage", model: config.model ?? "voyage-3", version: config.version ?? "v1" };
  }

  // Param intentionally omitted: this adapter throws rather than embed, so
  // there is nothing to consume. It never silently returns fake vectors.
  async embed(): Promise<EmbeddingResult[]> {
    this.requireApiKey("Voyage", this.config.apiKey);
    throw new Error("Voyage provider adapter is prepared but no real API credential is configured in this environment.");
  }
}
