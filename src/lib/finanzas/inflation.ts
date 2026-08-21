export interface InflationResult {
  adjustedAmount: number;
  totalIncrease: number;
  totalIncreasePercent: number;
}

/** Projects how much a given amount today would need to be in `years` to keep the same purchasing power, at a constant annual inflation rate. */
export function adjustForInflation(amount: number, annualRatePercent: number, years: number): InflationResult | null {
  if (!Number.isFinite(amount) || amount < 0) return null;
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) return null;
  if (!Number.isFinite(years) || years < 0) return null;

  const adjustedAmount = amount * (1 + annualRatePercent / 100) ** years;
  const totalIncrease = adjustedAmount - amount;
  const totalIncreasePercent = amount > 0 ? (totalIncrease / amount) * 100 : 0;

  return {
    adjustedAmount: round2(adjustedAmount),
    totalIncrease: round2(totalIncrease),
    totalIncreasePercent: round2(totalIncreasePercent),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
