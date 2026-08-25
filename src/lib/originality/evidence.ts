/**
 * Evidence model — keeps each signal that contributed to a match visible
 * and separately inspectable, instead of collapsing everything into one
 * opaque number.
 *
 * The product rule this encodes: a similarity figure must always be able
 * to answer "why", and a correctly attributed quote must never look the
 * same as unattributed copying.
 */

export type SemanticBand = "none" | "low" | "medium" | "high";

export interface MatchEvidence {
  /** n-gram overlap, 0–1. Always present — this is the engine that always runs. */
  lexicalScore: number;
  /** Cosine similarity, 0–1, or null when no embedding provider is configured. Null means "not assessed", never "no similarity". */
  semanticScore: number | null;
  /** True when the matched chunk also contains a detected in-text citation. */
  isCited: boolean;
  /** How much the source itself can be trusted (internal corpus is certain; an external source found by search is not). */
  sourceConfidence: "certain" | "high" | "medium" | "low";
}

export type MatchClassification =
  | "exact_copy"
  | "near_copy"
  | "semantic_similarity"
  | "attributed_quote"
  | "weak_signal";

export interface ClassifiedMatch {
  classification: MatchClassification;
  evidence: MatchEvidence;
  /** Plain-language reason, shown to the user. Never accusatory. */
  explanation: string;
}

export type HybridEvidenceMode = "none" | "lexical" | "semantic" | "hybrid";
export type SemanticAvailability = "semantic_unavailable" | "semantic_available";
export type MatchDecisionClassification =
  | "no_match"
  | "weak_similarity"
  | "moderate_similarity"
  | "strong_similarity"
  | "attributed_match"
  | "review_required";

export interface HybridEvidenceDecision {
  mode: HybridEvidenceMode;
  classification: MatchDecisionClassification;
  semanticState: SemanticAvailability;
  effectiveScore: number;
  reviewRequired: boolean;
  rationale: string;
}

// Bands, not a single "is it plagiarism" cutoff. Semantic similarity is
// inherently fuzzy — two people writing honestly about the same topic
// land in the 0.7s — so the bands describe strength of resemblance and
// leave interpretation to a human.
const SEMANTIC_HIGH = 0.9;
const SEMANTIC_MEDIUM = 0.82;
const SEMANTIC_LOW = 0.75;

export function evaluateHybridEvidence(evidence: MatchEvidence): HybridEvidenceDecision {
  const lexicalScore = Math.max(0, Math.min(1, evidence.lexicalScore));
  const semanticScore = evidence.semanticScore === null ? null : Math.max(0, Math.min(1, evidence.semanticScore));

  if (evidence.isCited) {
    return {
      mode: lexicalScore >= 0.5 ? "lexical" : "semantic",
      classification: "attributed_match",
      semanticState: semanticScore === null ? "semantic_unavailable" : "semantic_available",
      effectiveScore: Math.max(lexicalScore, semanticScore ?? 0),
      reviewRequired: false,
      rationale:
        "La cita está atribuida; la coincidencia corresponde al texto citado y no a una copia sin atribución.",
    };
  }

  if (semanticScore === null) {
    const reviewRequired = lexicalScore >= 0.5;
    const classification: MatchDecisionClassification =
      lexicalScore >= 0.7 ? "strong_similarity" : lexicalScore >= 0.35 ? "moderate_similarity" : lexicalScore >= 0.12 ? "weak_similarity" : "no_match";
    return {
      mode: lexicalScore >= 0.12 ? "lexical" : "none",
      classification,
      semanticState: "semantic_unavailable",
      effectiveScore: lexicalScore,
      reviewRequired,
      rationale: reviewRequired
        ? "Se revisa la coincidencia léxica porque el texto repite contenido suficiente para merecer una comprobación humana; la similitud semántica no está disponible."
        : "La coincidencia es demasiado débil para requerir revisión a partir de la evidencia léxica disponible; la similitud semántica no está disponible.",
    };
  }

  const semanticStrong = semanticScore >= SEMANTIC_LOW;
  const lexicalStrong = lexicalScore >= 0.5;

  if (lexicalScore <= 0.12 && semanticStrong) {
    return {
      mode: "semantic",
      classification: "review_required",
      semanticState: "semantic_available",
      effectiveScore: semanticScore,
      reviewRequired: true,
      rationale:
        "La coincidencia léxica es débil, pero la similitud semántica es alta: merece revisión humana porque la idea parece cercana aunque las palabras difieran.",
    };
  }

  if ((lexicalStrong || lexicalScore >= 0.38) && semanticStrong) {
    const effectiveScore = Math.min(1, (lexicalScore * 0.7) + (semanticScore * 0.5));
    return {
      mode: "hybrid",
      classification: "strong_similarity",
      semanticState: "semantic_available",
      effectiveScore,
      reviewRequired: true,
      rationale:
        "Las señales léxica y semántica apuntan en la misma dirección: la coincidencia combina repetición de palabras y parecido conceptual.",
    };
  }

  if (lexicalScore >= 0.45 && semanticScore < SEMANTIC_LOW) {
    return {
      mode: "lexical",
      classification: lexicalScore >= 0.7 ? "strong_similarity" : "moderate_similarity",
      semanticState: "semantic_available",
      effectiveScore: lexicalScore,
      reviewRequired: lexicalScore >= 0.5,
      rationale:
        "La evidencia léxica sigue siendo la principal. La similitud semántica es baja y no ha ganado fuerza suficiente para desplazar la decisión.",
    };
  }

  if (lexicalScore <= 0.1 && semanticScore <= 0.25) {
    return {
      mode: "none",
      classification: "no_match",
      semanticState: "semantic_available",
      effectiveScore: 0,
      reviewRequired: false,
      rationale: "No hay evidencia suficiente de coincidencia ni léxica ni semántica.",
    };
  }

  const effectiveScore = Math.max(lexicalScore, semanticScore * 0.8);
  return {
    mode: lexicalScore >= semanticScore ? "lexical" : "semantic",
    classification: effectiveScore >= 0.7 ? "moderate_similarity" : "weak_similarity",
    semanticState: "semantic_available",
    effectiveScore,
    reviewRequired: effectiveScore >= 0.5,
    rationale:
      "La evidencia no alcanza un nivel claro de alarma por sí sola, pero la coincidencia sigue siendo lo bastante relevante para revisar el contexto.",
  };
}

export function semanticBand(score: number | null): SemanticBand {
  if (score === null) return "none";
  if (score >= SEMANTIC_HIGH) return "high";
  if (score >= SEMANTIC_MEDIUM) return "medium";
  if (score >= SEMANTIC_LOW) return "low";
  return "none";
}

/**
 * Turns raw evidence into a classification plus a human explanation.
 *
 * Citation status is checked FIRST and deliberately: a passage that
 * resembles a source it also cites is expected behavior — that is what
 * quoting is — and must never be presented in the same visual or verbal
 * register as unattributed copying.
 */
export function classifyMatch(evidence: MatchEvidence): ClassifiedMatch {
  const band = semanticBand(evidence.semanticScore);

  if (evidence.isCited) {
    return {
      classification: "attributed_quote",
      evidence,
      explanation:
        "Este fragmento contiene una cita. La coincidencia probablemente corresponde al texto citado, no a una copia sin atribuir.",
    };
  }

  if (evidence.lexicalScore >= 1) {
    return {
      classification: "exact_copy",
      evidence,
      explanation: "El texto coincide palabra por palabra con la fuente. Revisa si debería ir citado o entrecomillado.",
    };
  }

  if (evidence.lexicalScore >= 0.5) {
    return {
      classification: "near_copy",
      evidence,
      explanation: `El texto coincide en gran parte con la fuente (${Math.round(evidence.lexicalScore * 100)}% de solapamiento). Revisa si necesita atribución.`,
    };
  }

  if (band === "high" || band === "medium") {
    return {
      classification: "semantic_similarity",
      evidence,
      explanation:
        "El texto expresa ideas muy parecidas a las de la fuente aunque con otras palabras. Esto puede ser legítimo — vale la pena revisar si la idea necesita atribución.",
    };
  }

  return {
    classification: "weak_signal",
    evidence,
    explanation: "Parecido débil. Probablemente coincidencia por vocabulario común del tema.",
  };
}

/** Labels for the UI. Never contains the word "plagio" — by design. */
export const CLASSIFICATION_LABELS: Record<MatchClassification, string> = {
  exact_copy: "Coincidencia exacta",
  near_copy: "Coincidencia cercana",
  semantic_similarity: "Similitud de contenido",
  attributed_quote: "Coincidencia atribuida",
  weak_signal: "Parecido débil",
};
