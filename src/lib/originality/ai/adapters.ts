import "server-only";
import { AI_BUDGET, computeCostUsd, type AiCompletion, type AiCompletionRequest, type AiProvider } from "@/lib/originality/ai/provider";

/**
 * OpenAI chat-completions adapter.
 *
 * Deliberately hand-written against the HTTP API rather than pulling in
 * the SDK: this makes exactly one kind of request, and the surface used
 * here (messages, response_format, max_completion_tokens, usage) is the
 * stable part of that API. A dependency would add weight to a server
 * bundle for no capability.
 *
 * `max_completion_tokens` is the current parameter name; `max_tokens` is
 * rejected by the gpt-5 family. Verified against the live API before this
 * was written — the older spelling silently costs you a 400.
 */

interface OpenAiChatResponse {
  choices?: { message?: { content?: string | null }; finish_reason?: string }[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    prompt_tokens_details?: { cached_tokens?: number };
  };
  error?: { message?: string };
}

export interface OpenAiChatConfig {
  apiKey: string;
  model: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export class OpenAiChatAdapter implements AiProvider {
  readonly model: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(config: OpenAiChatConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.timeoutMs = config.timeoutMs ?? AI_BUDGET.timeoutMs;
    this.maxRetries = config.maxRetries ?? 1;
  }

  async complete(request: AiCompletionRequest): Promise<AiCompletion> {
    const started = Date.now();
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: "system", content: request.system },
              { role: "user", content: request.user },
            ],
            ...(request.json ? { response_format: { type: "json_object" } } : {}),
            max_completion_tokens: Math.min(request.maxOutputTokens, AI_BUDGET.maxOutputTokens),
          }),
        });

        if (res.status === 429 || res.status >= 500) {
          // Transient. Retry once, then give up — the caller degrades to a
          // report with no prose rather than holding the pipeline open.
          lastError = new Error(`OpenAI HTTP ${res.status}`);
          continue;
        }

        const json = (await res.json()) as OpenAiChatResponse;
        if (!res.ok) {
          // The provider's message can echo request content, so it is
          // logged upstream but never surfaced to the user verbatim.
          throw new Error(`OpenAI HTTP ${res.status}: ${json.error?.message ?? "sin detalle"}`);
        }

        const choice = json.choices?.[0];
        const inputTokens = json.usage?.prompt_tokens ?? 0;
        const outputTokens = json.usage?.completion_tokens ?? 0;

        return {
          content: choice?.message?.content ?? "",
          truncated: choice?.finish_reason === "length",
          usage: {
            inputTokens,
            outputTokens,
            cachedInputTokens: json.usage?.prompt_tokens_details?.cached_tokens ?? 0,
            durationMs: Date.now() - started,
            costUsd: computeCostUsd(inputTokens, outputTokens),
            model: this.model,
          },
        };
      } catch (error) {
        lastError = error;
        if (controller.signal.aborted) break; // A timeout will not fix itself.
      } finally {
        clearTimeout(timer);
      }
    }

    throw lastError instanceof Error ? lastError : new Error("La llamada al modelo falló.");
  }
}
