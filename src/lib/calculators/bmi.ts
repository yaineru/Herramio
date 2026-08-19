export type BmiCategory = "bajo-peso" | "normal" | "sobrepeso" | "obesidad";

export interface BmiResult {
  bmi: number;
  category: BmiCategory;
  categoryLabel: string;
}

const CATEGORY_LABELS: Record<BmiCategory, string> = {
  "bajo-peso": "Bajo peso",
  normal: "Peso normal",
  sobrepeso: "Sobrepeso",
  obesidad: "Obesidad",
};

function categorize(bmi: number): BmiCategory {
  if (bmi < 18.5) return "bajo-peso";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "sobrepeso";
  return "obesidad";
}

/**
 * Calculates BMI from weight (kg) and height (cm). Returns null for
 * non-positive or non-finite inputs, since BMI is undefined for them.
 */
export function calculateBmi(weightKg: number, heightCm: number): BmiResult | null {
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm)) return null;
  if (weightKg <= 0 || heightCm <= 0) return null;

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const category = categorize(bmi);

  return { bmi, category, categoryLabel: CATEGORY_LABELS[category] };
}
