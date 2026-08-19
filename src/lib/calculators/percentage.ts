export type PercentageMode = "of" | "isWhatPercent" | "increase" | "decrease";

export interface PercentageResult {
  value: number;
  formula: string;
}

/** X% de Y — ej. 20% de 500 = 100 */
export function percentOf(percent: number, base: number): number {
  return (percent / 100) * base;
}

/** X es qué porcentaje de Y — ej. 50 de 200 = 25% (null si Y es 0, división inválida) */
export function whatPercent(part: number, base: number): number | null {
  if (base === 0) return null;
  return (part / base) * 100;
}

/** Aumentar Y en X% — ej. 500 + 20% = 600 */
export function increaseByPercent(base: number, percent: number): number {
  return base * (1 + percent / 100);
}

/** Disminuir Y en X% — ej. 500 - 20% = 400 */
export function decreaseByPercent(base: number, percent: number): number {
  return base * (1 - percent / 100);
}

/**
 * Calcula el resultado y la fórmula legible para un modo dado. Devuelve
 * null cuando los valores de entrada no son números válidos o cuando la
 * operación no está definida (ej. "qué % es X de 0").
 */
export function calculatePercentage(
  mode: PercentageMode,
  a: number,
  b: number,
): PercentageResult | null {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;

  switch (mode) {
    case "of":
      return { value: percentOf(a, b), formula: `${a}% de ${b}` };
    case "isWhatPercent": {
      const value = whatPercent(a, b);
      if (value === null) return null;
      return { value, formula: `${a} es qué % de ${b}` };
    }
    case "increase":
      return { value: increaseByPercent(a, b), formula: `${a} + ${b}%` };
    case "decrease":
      return { value: decreaseByPercent(a, b), formula: `${a} - ${b}%` };
  }
}
