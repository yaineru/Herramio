export interface ConfusionMatrix {
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
}

export interface EvaluationMetrics extends ConfusionMatrix {
  /** Of everything flagged, how much was correctly flagged. Undefined when nothing was flagged. */
  precision: number | null;
  /** Of everything that should have been flagged, how much was. Undefined when there was nothing to find. */
  recall: number | null;
  f1: number | null;
  total: number;
  totalSamples: number;
  positiveSamples: number;
  negativeSamples: number;
}

export interface EvaluatedCase {
  id: string;
  kind?: string;
  expected: boolean;
  actual: boolean;
  outcome: "TP" | "FP" | "TN" | "FN";
}

/**
 * Computes precision/recall/F1 from real engine output. Returns `null`
 * rather than 0 for undefined ratios (no predictions, or no positives to
 * find) — reporting 0 there would misrepresent "not applicable" as
 * "failed", and these numbers exist precisely to be trusted.
 */
export function computeMetrics(cases: EvaluatedCase[]): EvaluationMetrics {
  const truePositives = cases.filter((c) => c.outcome === "TP").length;
  const falsePositives = cases.filter((c) => c.outcome === "FP").length;
  const trueNegatives = cases.filter((c) => c.outcome === "TN").length;
  const falseNegatives = cases.filter((c) => c.outcome === "FN").length;

  const predictedPositive = truePositives + falsePositives;
  const actualPositive = truePositives + falseNegatives;
  const positiveSamples = cases.filter((c) => c.expected).length;
  const negativeSamples = cases.filter((c) => !c.expected).length;

  const precision = predictedPositive === 0 ? null : truePositives / predictedPositive;
  const recall = actualPositive === 0 ? null : truePositives / actualPositive;
  const f1 =
    precision === null || recall === null || precision + recall === 0
      ? null
      : (2 * precision * recall) / (precision + recall);

  const confusionMatrix: ConfusionMatrix = {
    truePositives,
    falsePositives,
    trueNegatives,
    falseNegatives,
  };

  return {
    ...confusionMatrix,
    precision,
    recall,
    f1,
    total: cases.length,
    totalSamples: cases.length,
    positiveSamples,
    negativeSamples,
  };
}

export function computeMetricsByKind(cases: EvaluatedCase[]): Record<string, EvaluationMetrics> {
  const groups = new Map<string, EvaluatedCase[]>();

  const normalizedKind = (kind?: string): string => {
    if (!kind) return "unknown";
    if (["exact", "exact_long", "case_variation", "cited_copy", "uncited_copy", "misattributed_citation"].includes(kind)) {
      return "exact_copy";
    }
    if (["inserted_words", "deleted_words", "words_inserted", "words_deleted", "one_word_changed"].includes(kind)) {
      return "near_copy";
    }
    if (["punctuation_only", "split_sentences", "merged_sentences"].includes(kind)) {
      return "near_copy";
    }
    if (["embedded_copy", "multiple_fragments", "short_fragment"].includes(kind)) {
      return "containment";
    }
    if (["paraphrase", "paraphrase_with_citation"].includes(kind)) {
      return "paraphrase";
    }
    if (["semantic_related", "generic_academic", "independent_concept"].includes(kind)) {
      return "semantic_related";
    }
    if (["common_heading", "generic_heading"].includes(kind)) {
      return "common_heading";
    }
    if (["unrelated"].includes(kind)) {
      return "unrelated";
    }
    return kind;
  };

  for (const item of cases) {
    const kind = normalizedKind(item.kind ?? item.id);
    const bucket = groups.get(kind) ?? [];
    bucket.push(item);
    groups.set(kind, bucket);
  }

  const result: Record<string, EvaluationMetrics> = {};
  for (const [kind, items] of groups) {
    result[kind] = computeMetrics(items);
  }
  return result;
}

export function classifyOutcome(expected: boolean, actual: boolean): EvaluatedCase["outcome"] {
  if (expected && actual) return "TP";
  if (!expected && actual) return "FP";
  if (!expected && !actual) return "TN";
  return "FN";
}

/** Human-readable summary for test output and docs — real numbers, never rounded into looking better than they are. */
export function formatMetrics(m: EvaluationMetrics): string {
  const pct = (v: number | null) => (v === null ? "n/a" : `${(v * 100).toFixed(1)}%`);
  return [
    `total=${m.total}`,
    `positiveSamples=${m.positiveSamples} negativeSamples=${m.negativeSamples}`,
    `TP=${m.truePositives} FP=${m.falsePositives} TN=${m.trueNegatives} FN=${m.falseNegatives}`,
    `precision=${pct(m.precision)}`,
    `recall=${pct(m.recall)}`,
    `f1=${pct(m.f1)}`,
  ].join("  ");
}
