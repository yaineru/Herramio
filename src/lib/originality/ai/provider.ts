import "server-only";

/**
 * The AI explanation layer's contract, kept separate from any SDK.
 *
 * This layer explains evidence the deterministic engine already produced.
 * It never decides anything. Similarity, citations and references are
 * computed by code that has no prompt in it; if this layer is off, broken,
 * or over budget, the report is still complete and still correct — it just
 * has no prose alongside the numbers.
 *
 * That ordering is the whole design. An LLM asked "did this student
 * plagiarise?" will answer, confidently, and be wrong often enough to ruin
 * someone's degree. An LLM asked "explain what these five measured matches
 * mean, and say what you cannot tell" is doing something it is actually
 * good at.
 */

export interface AiUsage {
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
  /**
   * Only set when a price is explicitly configured. Token counts come from
   * the provider and are exact; a price does not, so an unconfigured price
   * yields null rather than a plausible-looking guess.
   */
  costUsd: number | null;
  model: string;
  /** Provider-side prompt cache hits, when the provider reports them. */
  cachedInputTokens: number;
}

export interface AiCompletion {
  /** Raw model text. Callers parse and validate; nothing trusts this blindly. */
  content: string;
  usage: AiUsage;
  /** True when the model stopped because it hit the output ceiling. */
  truncated: boolean;
}

export interface AiCompletionRequest {
  system: string;
  user: string;
  maxOutputTokens: number;
  /** Ask the provider to constrain output to a JSON object. */
  json: boolean;
}

export interface AiProvider {
  readonly model: string;
  complete(request: AiCompletionRequest): Promise<AiCompletion>;
}

/** Raised when the provider is genuinely unavailable. Never a reason to fabricate output. */
export class AiProviderNotConfiguredError extends Error {
  constructor() {
    super("El análisis con IA no está configurado.");
    this.name = "AiProviderNotConfiguredError";
  }
}

/**
 * Budget, enforced before any call is made.
 *
 * A single originality analysis gets exactly one AI call. There is no
 * agentic loop, no retry-with-more-context, no per-match call that
 * multiplies with document length — the cost of analysing a document is
 * bounded and knowable before it runs.
 */
export const AI_BUDGET = {
  /** Characters of evidence allowed into one prompt. */
  maxEvidenceChars: 8000,
  /** Hard ceiling on generated tokens. */
  maxOutputTokens: 1400,
  /** Calls per analysis. One. */
  maxCallsPerAnalysis: 1,
  /** Give up rather than hold the pipeline open. */
  timeoutMs: 45_000,
} as const;

/**
 * Claims this product does not make, in any language the report is served
 * in. Checked against generated text before it is shown or stored.
 *
 * This is not prompt hygiene — the system prompt already forbids these.
 * It is the backstop for the case where the model says it anyway, because
 * "the prompt told it not to" is not a control. A tripped guard drops the
 * explanation entirely; a report with no prose is fine, a report that
 * accuses someone is not.
 */
const FORBIDDEN_CLAIM_PATTERNS: readonly RegExp[] = [
  /\bplagi\w*\s+(confirmad|comprobad|demostrad|detectad)\w*/i,
  /\b(es|hay|existe)\s+plagio\b/i,
  /\bconfirmed\s+plagiarism\b/i,
  /\bel\s+(estudiante|autor|alumno)\s+(copió|hizo trampa|plagió|engañó)/i,
  /\b(copió|plagió)\s+(deliberada|intencional)\w*/i,
  /\b100\s*%\s*(de\s*)?(precisi[óo]n|exactitud|seguridad|certeza)/i,
  /\bgenerado\s+(al\s+)?100\s*%\s+por\s+(una\s+)?ia\b/i,
  /\b100\s*%\s+ai[-\s]generated\b/i,
  /\b(escrito|generado)\s+por\s+(una\s+)?ia\s+con\s+(certeza|seguridad)/i,
  /\bmejor\s+que\s+turnitin\b/i,
  /\bdetecta\s+(todo\s+el\s+)?plagio\b/i,
];

export interface ForbiddenClaimResult {
  found: boolean;
  /** The pattern source that matched, for logging. Never shown to the user. */
  pattern: string | null;
}

export function findForbiddenClaim(text: string): ForbiddenClaimResult {
  for (const pattern of FORBIDDEN_CLAIM_PATTERNS) {
    if (pattern.test(text)) return { found: true, pattern: pattern.source };
  }
  return { found: false, pattern: null };
}

/**
 * Cost from measured tokens, but only when a price is configured.
 *
 * Model prices change and are not discoverable from the API, so this
 * project does not carry a hardcoded price table that would quietly go
 * stale and misreport spend. Configure AI_PRICE_INPUT_PER_MTOK and
 * AI_PRICE_OUTPUT_PER_MTOK to get a cost; leave them unset and the report
 * shows exact token counts with no cost, which is honest rather than
 * convenient.
 */
export function computeCostUsd(inputTokens: number, outputTokens: number): number | null {
  const input = Number.parseFloat(process.env.AI_PRICE_INPUT_PER_MTOK ?? "");
  const output = Number.parseFloat(process.env.AI_PRICE_OUTPUT_PER_MTOK ?? "");
  if (!Number.isFinite(input) || !Number.isFinite(output)) return null;
  return (inputTokens / 1_000_000) * input + (outputTokens / 1_000_000) * output;
}
