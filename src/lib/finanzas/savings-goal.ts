export interface SavingsGoalResult {
  monthlyContribution: number;
  alreadyReached: boolean;
}

/** Solves for the fixed monthly contribution needed to reach `targetAmount` in `months`, given current savings and a monthly-compounding annual rate. */
export function calculateSavingsGoal(
  targetAmount: number,
  currentSavings: number,
  months: number,
  annualRatePercent: number,
): SavingsGoalResult | null {
  if (!Number.isFinite(targetAmount) || targetAmount <= 0) return null;
  if (!Number.isFinite(currentSavings) || currentSavings < 0) return null;
  if (!Number.isInteger(months) || months <= 0) return null;
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) return null;

  const monthlyRate = annualRatePercent / 100 / 12;
  const futureValueOfCurrent = currentSavings * (1 + monthlyRate) ** months;

  if (futureValueOfCurrent >= targetAmount) {
    return { monthlyContribution: 0, alreadyReached: true };
  }

  const remaining = targetAmount - futureValueOfCurrent;
  const monthlyContribution =
    monthlyRate === 0 ? remaining / months : (remaining * monthlyRate) / ((1 + monthlyRate) ** months - 1);

  return { monthlyContribution: Math.round(monthlyContribution * 100) / 100, alreadyReached: false };
}
