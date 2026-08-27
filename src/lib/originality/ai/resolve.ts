import "server-only";
import { OpenAiChatAdapter } from "@/lib/originality/ai/adapters";
import { AiProviderNotConfiguredError, type AiProvider } from "@/lib/originality/ai/provider";

/**
 * The single place that decides whether the AI explanation layer is on.
 *
 * Same shape, and the same hard rule, as the semantic resolver: a provider
 * that is named but has no adapter, or has an adapter but no key, resolves
 * to null. Null means "no explanation in this report" — it never means
 * "substitute something plausible". There is no mock path here at all,
 * because a fabricated explanation of real evidence is worse than a
 * fabricated vector: a person would read it and believe it.
 *
 * The layer is opt-in via AI_ANALYSIS. It stays off until switched on
 * deliberately, so a stray OPENAI_API_KEY — which the semantic layer also
 * reads — cannot start spending on prose nobody asked for.
 */

const IMPLEMENTED_PROVIDERS: readonly string[] = ["openai"];

/** Default chosen for cost against a beta's volume; verified present on the account before being hardcoded. */
const DEFAULT_MODEL = "gpt-5.4-mini";

function readApiKey(): string {
  return (process.env.AI_PROVIDER_API_KEY ?? process.env.OPENAI_API_KEY ?? "").trim();
}

export function buildAiProviderFromEnv(): AiProvider | null {
  const provider = (process.env.AI_ANALYSIS ?? "").trim().toLowerCase();
  if (!provider || provider === "off" || provider === "false") return null;

  if (!IMPLEMENTED_PROVIDERS.includes(provider)) {
    console.warn(
      `AI_ANALYSIS="${provider}" no tiene un adaptador implementado. ` +
        `La explicación con IA permanece desactivada (no se inventa texto).`,
    );
    return null;
  }

  const apiKey = readApiKey();
  if (!apiKey) {
    console.warn(
      `AI_ANALYSIS="${provider}" está configurado pero falta la API key ` +
        `(AI_PROVIDER_API_KEY u OPENAI_API_KEY). La explicación con IA permanece desactivada.`,
    );
    return null;
  }

  return new OpenAiChatAdapter({
    apiKey,
    model: process.env.AI_MODEL?.trim() || DEFAULT_MODEL,
  });
}

export function getAiProvider(): AiProvider | null {
  return buildAiProviderFromEnv();
}

export function requireAiProvider(): AiProvider {
  const provider = getAiProvider();
  if (!provider) throw new AiProviderNotConfiguredError();
  return provider;
}

export function isAiAnalysisAvailable(): boolean {
  return getAiProvider() !== null;
}
