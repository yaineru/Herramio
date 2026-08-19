export type RuleOfThreeType = "directa" | "inversa";

/**
 * Solves "A is to B as C is to X" (direct proportion: X = B·C / A) or its
 * inverse form (A·B = C·X, so X = A·B / C). Returns null for non-finite
 * input or a division by zero.
 */
export function calculateRuleOfThree(
  a: number,
  b: number,
  c: number,
  type: RuleOfThreeType,
): number | null {
  if (![a, b, c].every(Number.isFinite)) return null;

  if (type === "directa") {
    if (a === 0) return null;
    return (b * c) / a;
  }

  if (c === 0) return null;
  return (a * b) / c;
}
