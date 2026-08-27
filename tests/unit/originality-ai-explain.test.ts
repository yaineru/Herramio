import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { buildEvidencePrompt, parseExplanation, explainEvidence, type EvidenceInput } from "@/lib/originality/ai/explain";
import { buildAiProviderFromEnv } from "@/lib/originality/ai/resolve";
import { findForbiddenClaim, type AiProvider } from "@/lib/originality/ai/provider";

/**
 * The AI layer's guards, tested offline.
 *
 * The live behaviour (that a real model actually reports an injection
 * instead of obeying it) is checked by scripts/ai-smoke.ts against the
 * real provider, because that is not something a mock can demonstrate.
 * What is tested here is everything that must hold regardless of what the
 * model returns — including the case where it returns something unsafe.
 */

const evidence: EvidenceInput = {
  similarityIndex: 0.34,
  exactRatio: 0.12,
  nearExactRatio: 0.22,
  semanticRatio: 0,
  semanticAvailable: false,
  wordCount: 2400,
  citationCount: 7,
  references: { total: 9, verified: 5, notFound: 2, unverified: 2 },
  matches: [
    {
      similarity: 0.91,
      matchType: "exact",
      documentExcerpt: "La integridad académica es el fundamento de la evaluación.",
      sourceExcerpt: "La integridad académica es el fundamento de la evaluación.",
      sourceLabel: "tesis-anterior.pdf",
    },
  ],
};

const validReply = JSON.stringify({
  summary: "El documento presenta coincidencias que conviene revisar.",
  findings: [{ title: "Coincidencia literal", detail: "Una frase coincide con una fuente comparada.", severity: "attention" }],
  recommendations: ["Revisar la atribución del pasaje señalado."],
  uncertainty: "No puede determinarse intención ni si el documento es original.",
  promptInjectionNoticed: false,
});

function providerReturning(content: string): AiProvider {
  return {
    model: "test-model",
    complete: vi.fn().mockResolvedValue({
      content,
      truncated: false,
      usage: { inputTokens: 10, outputTokens: 5, cachedInputTokens: 0, durationMs: 1, costUsd: null, model: "test-model" },
    }),
  };
}

describe("evidence prompt keeps trusted numbers apart from untrusted text", () => {
  it("wraps excerpts in an unguessable fence", () => {
    const { user } = buildEvidencePrompt(evidence);
    expect(user).toMatch(/<<<EVIDENCIA_[0-9a-f]{24}>>>/);
  });

  it("uses a different fence every time, so a document cannot close it", () => {
    const a = buildEvidencePrompt(evidence).user.match(/<<<EVIDENCIA_[0-9a-f]{24}>>>/)?.[0];
    const b = buildEvidencePrompt(evidence).user.match(/<<<EVIDENCIA_[0-9a-f]{24}>>>/)?.[0];
    expect(a).not.toBe(b);
  });

  it("puts the excerpt inside the fenced block, not in the instructions", () => {
    const { user } = buildEvidencePrompt(evidence);
    const fence = user.match(/<<<EVIDENCIA_[0-9a-f]{24}>>>/)![0];
    // The fence is named three times: once by the preamble that declares
    // it untrusted, then as the block's open and close. The content is
    // what sits between the last two.
    const parts = user.split(fence);
    expect(parts).toHaveLength(4);
    expect(parts[parts.length - 2]).toContain("La integridad académica es el fundamento");
    // And it must NOT appear in the instruction half.
    expect(parts[0]).not.toContain("La integridad académica es el fundamento");
  });

  it("redacts credential-shaped text before it can reach the provider", () => {
    const withSecret = structuredClone(evidence);
    withSecret.matches[0].documentExcerpt = `config: sk-proj-${"a".repeat(40)} fin`;
    const { user, redactions } = buildEvidencePrompt(withSecret);
    expect(redactions).toBeGreaterThan(0);
    expect(user).not.toMatch(/sk-proj-a{40}/);
  });

  it("states plainly that semantic analysis did not run", () => {
    // Silence here would let the model read 0 % semantic as a measurement.
    const { user } = buildEvidencePrompt(evidence);
    expect(user).toContain("NO DISPONIBLE");
  });

  it("reports the semantic ratio when semantic actually ran", () => {
    const { user } = buildEvidencePrompt({ ...evidence, semanticAvailable: true, semanticRatio: 0.18 });
    expect(user).toContain("18.0 %");
    expect(user).not.toContain("NO DISPONIBLE");
  });
});

describe("output validation refuses anything it does not fully understand", () => {
  it("rejects text that is not JSON", () => {
    expect(parseExplanation("lo siento, no puedo ayudarte")).toBeNull();
  });

  it("rejects an explanation with no stated uncertainty", () => {
    // A summary with no limits is a verdict wearing a summary's clothes.
    const reply = JSON.stringify({ summary: "Todo bien.", findings: [], recommendations: [], uncertainty: "" });
    expect(parseExplanation(reply)).toBeNull();
  });

  it("rejects an explanation with no summary", () => {
    const reply = JSON.stringify({ summary: "", uncertainty: "No se puede determinar la intención." });
    expect(parseExplanation(reply)).toBeNull();
  });

  it("accepts a well-formed explanation", () => {
    const parsed = parseExplanation(validReply);
    expect(parsed?.summary).toContain("coincidencias");
    expect(parsed?.findings).toHaveLength(1);
  });

  it("caps findings and recommendations rather than rendering whatever arrives", () => {
    const reply = JSON.stringify({
      summary: "Resumen.",
      uncertainty: "Límites.",
      findings: Array.from({ length: 20 }, (_, i) => ({ title: `t${i}`, detail: "d", severity: "info" })),
      recommendations: Array.from({ length: 20 }, (_, i) => `r${i}`),
    });
    const parsed = parseExplanation(reply);
    expect(parsed!.findings.length).toBeLessThanOrEqual(5);
    expect(parsed!.recommendations.length).toBeLessThanOrEqual(4);
  });

  it("falls back to the mildest severity for a value outside the scale", () => {
    const reply = JSON.stringify({
      summary: "Resumen.",
      uncertainty: "Límites.",
      findings: [{ title: "t", detail: "d", severity: "catastrophic" }],
    });
    expect(parseExplanation(reply)!.findings[0].severity).toBe("info");
  });
});

describe("forbidden claims are dropped, not softened", () => {
  const forbidden = [
    "Se confirma que hay plagio en el documento.",
    "El estudiante copió deliberadamente el texto.",
    "Este análisis tiene 100 % de precisión.",
    "El texto fue generado al 100 % por IA.",
    "Nuestro motor es mejor que Turnitin.",
  ];

  for (const claim of forbidden) {
    it(`detecta: "${claim.slice(0, 42)}…"`, () => {
      expect(findForbiddenClaim(claim).found).toBe(true);
    });
  }

  it("does not flag legitimate hedged language", () => {
    // The guard must not eat the honest sentences the product depends on.
    const ok =
      "La similitud no es un veredicto: puede incluir citas correctamente atribuidas. " +
      "Conviene revisar manualmente los pasajes señalados antes de sacar conclusiones.";
    expect(findForbiddenClaim(ok).found).toBe(false);
  });

  it("discards the whole explanation when a forbidden claim appears anywhere in it", () => {
    const reply = JSON.stringify({
      summary: "Resumen correcto y prudente.",
      uncertainty: "Límites del análisis.",
      // Buried in a recommendation, where it would be easy to miss.
      recommendations: ["Sancionar al alumno: se confirma que hay plagio."],
    });
    expect(parseExplanation(reply)).toBeNull();
  });
});

describe("the layer fails soft, always", () => {
  it("returns null when no provider is configured", async () => {
    expect(await explainEvidence(evidence, null)).toBeNull();
  });

  it("returns null when the provider throws, without propagating", async () => {
    const provider: AiProvider = { model: "m", complete: vi.fn().mockRejectedValue(new Error("502")) };
    await expect(explainEvidence(evidence, provider)).resolves.toBeNull();
  });

  it("returns null when the model returns unparseable output", async () => {
    await expect(explainEvidence(evidence, providerReturning("no soy JSON"))).resolves.toBeNull();
  });

  it("returns the explanation with measured usage attached", async () => {
    const result = await explainEvidence(evidence, providerReturning(validReply));
    expect(result?.usage.inputTokens).toBe(10);
    expect(result?.model).toBe("test-model");
  });
});

describe("the provider resolver never invents a provider", () => {
  const saved = { ...process.env };
  beforeEach(() => {
    delete process.env.AI_ANALYSIS;
    delete process.env.AI_PROVIDER_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });
  afterEach(() => {
    process.env = { ...saved };
  });

  it("is off unless explicitly switched on", () => {
    // A stray OPENAI_API_KEY (which the semantic layer also reads) must
    // not start paying for prose nobody asked for.
    process.env.OPENAI_API_KEY = "sk-test";
    expect(buildAiProviderFromEnv()).toBeNull();
  });

  it("stays off for a provider with no adapter", () => {
    process.env.AI_ANALYSIS = "some-other-llm";
    process.env.OPENAI_API_KEY = "sk-test";
    expect(buildAiProviderFromEnv()).toBeNull();
  });

  it("stays off when the key is missing, rather than substituting anything", () => {
    process.env.AI_ANALYSIS = "openai";
    expect(buildAiProviderFromEnv()).toBeNull();
  });

  it("builds a real adapter when provider and key are both present", () => {
    process.env.AI_ANALYSIS = "openai";
    process.env.OPENAI_API_KEY = "sk-test";
    expect(buildAiProviderFromEnv()?.model).toBeTruthy();
  });

  it("honours an explicit off switch", () => {
    process.env.AI_ANALYSIS = "off";
    process.env.OPENAI_API_KEY = "sk-test";
    expect(buildAiProviderFromEnv()).toBeNull();
  });
});
