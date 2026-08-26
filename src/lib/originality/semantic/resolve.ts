import "server-only";
import { OpenAIEmbeddingAdapter } from "@/lib/originality/semantic/adapters";
import {
  MockEmbeddingProvider,
  SemanticProviderNotConfiguredError,
  STORED_EMBEDDING_DIMENSIONS,
  type EmbeddingProvider,
} from "@/lib/originality/semantic/provider";

/**
 * The single place that decides whether semantic analysis is on.
 *
 * It lives in its own module rather than in provider.ts because the
 * adapters import provider.ts for its types and constants; putting the
 * resolution there too would make the two files import each other. This
 * module depends on both and nothing depends on it except callers, so the
 * graph stays one-directional.
 *
 * There used to be TWO functions with this job — a hardened one in
 * provider.ts that always returned null, and a second one in adapters.ts
 * that built real adapters with no production guard and fell back to a
 * mock for anything it did not recognise. Only the first was wired up, so
 * the difference was invisible; whoever connected a provider next had a
 * fifty-fifty chance of importing the unguarded one. There is now exactly
 * one.
 */

/** Provider names with a REAL adapter behind them. */
const IMPLEMENTED_PROVIDERS: readonly string[] = ["openai"];

/**
 * OpenAI's own convention is OPENAI_API_KEY; this project's generic name
 * is EMBEDDING_PROVIDER_API_KEY. Both are accepted because a key arriving
 * under the obvious name and being silently ignored is a worse failure
 * than supporting two spellings.
 */
function readApiKey(): string {
  return (process.env.EMBEDDING_PROVIDER_API_KEY ?? process.env.OPENAI_API_KEY ?? "").trim();
}

/**
 * Resolves the configured embedding provider, or null when semantic
 * analysis is genuinely unavailable.
 *
 * Two rules this function exists to enforce, both of which were violated
 * by an earlier version that returned a mock labelled
 * `openai-text-embedding-3-small` whenever an API key was present:
 *
 *  1. The mock NEVER stands in for a real provider. Its vectors are
 *     deterministic nonsense derived from string length, so similarity
 *     computed from them is meaningless. Returning it under a real
 *     model's name would put fabricated numbers in front of someone
 *     deciding whether a student plagiarised, and would persist those
 *     vectors into document_chunk_embeddings under a real model name,
 *     poisoning the corpus for the day a genuine adapter is connected.
 *  2. The mock never activates in production, even when explicitly asked
 *     for — a stray env var must not be able to turn fake analysis on for
 *     real users.
 *
 * Naming a provider that has no adapter, or one whose key is missing,
 * returns null and logs why. That surfaces as an honest "semantic
 * analysis unavailable" rather than a zero score.
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
        `El análisis semántico permanece desactivado (no se inventan embeddings). Ver EMBEDDINGS.md.`,
    );
    return null;
  }

  const apiKey = readApiKey();
  if (!apiKey) {
    // A configured provider with no credential is "unavailable", never a
    // reason to reach for the mock.
    console.warn(
      `EMBEDDING_PROVIDER="${provider}" está configurado pero falta la API key ` +
        `(EMBEDDING_PROVIDER_API_KEY u OPENAI_API_KEY). El análisis semántico permanece desactivado.`,
    );
    return null;
  }

  if (provider === "openai") {
    return new OpenAIEmbeddingAdapter({
      provider: "openai",
      apiKey,
      // 1536 native, which is exactly what the vector column is declared
      // with — see EMBEDDINGS.md for why this model and not another.
      model: process.env.EMBEDDING_MODEL?.trim() || "text-embedding-3-small",
      version: "v1",
      dimensions: STORED_EMBEDDING_DIMENSIONS,
      batchSize: 32,
      timeoutMs: 20_000,
      maxRetries: 2,
    });
  }

  // Unreachable: every entry in IMPLEMENTED_PROVIDERS is handled above.
  // Returning null rather than throwing keeps the failure mode "semantic
  // unavailable" instead of "analysis crashed".
  return null;
}

export function getEmbeddingProvider(): EmbeddingProvider | null {
  return buildEmbeddingProviderFromEnv();
}

export function requireEmbeddingProvider(): EmbeddingProvider {
  const provider = getEmbeddingProvider();
  if (!provider) throw new SemanticProviderNotConfiguredError();
  return provider;
}

export function isSemanticAnalysisAvailable(): boolean {
  return getEmbeddingProvider() !== null;
}
