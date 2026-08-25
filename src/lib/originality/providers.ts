import "server-only";

/**
 * Clean seams for capabilities this project has no credentials for yet —
 * none of these are implemented, and none are called anywhere in the
 * pipeline today. They exist so that plugging in a real provider later is
 * "implement this interface", never "redesign the pipeline". See
 * ORIGINALITY.md for exactly what's needed to activate each one.
 */

export interface EmbeddingProvider {
  readonly name: string;
  embed(texts: string[]): Promise<number[][]>;
}

export interface WebSearchResult {
  url: string;
  title: string;
  snippet: string;
}

export interface WebSearchProvider {
  readonly name: string;
  search(query: string): Promise<WebSearchResult[]>;
}

export interface AiWritingAnalysisResult {
  /** 0-1, never presented as a certainty — see ORIGINALITY.md's honesty rules. */
  estimatedProbability: number;
  confidence: "low" | "medium" | "high";
  explanation: string;
}

export interface AiAnalysisProvider {
  readonly name: string;
  analyzeWritingPatterns(text: string): Promise<AiWritingAnalysisResult>;
}

/**
 * Returns the configured provider, or null when none is set up —
 * callers MUST treat null as "this capability is unavailable" and say so
 * in the report, never substitute a fabricated result.
 */
export function getEmbeddingProvider(): EmbeddingProvider | null {
  // No EMBEDDING_PROVIDER configured — see ORIGINALITY.md "Cómo activar
  // similitud semántica" for what a real implementation needs (an API key
  // for an embedding model, e.g. OpenAI/Cohere/Voyage, plus pgvector
  // columns this migration deliberately doesn't add yet).
  return null;
}

export function getWebSearchProvider(): WebSearchProvider | null {
  // No WEB_SEARCH_PROVIDER configured — see ORIGINALITY.md "Cómo activar
  // búsqueda de fuentes externas".
  return null;
}

export function getAiAnalysisProvider(): AiAnalysisProvider | null {
  // No AI_ANALYSIS_PROVIDER configured — see ORIGINALITY.md "Cómo activar
  // el indicador de escritura asistida por IA".
  return null;
}
