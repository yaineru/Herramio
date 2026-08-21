export interface CompoundInterestYear {
  year: number;
  contributed: number;
  interest: number;
  balance: number;
}

export interface CompoundInterestResult {
  finalBalance: number;
  totalContributed: number;
  totalInterest: number;
  yearly: CompoundInterestYear[];
}

/**
 * Compound interest with optional fixed monthly contributions, compounded
 * `compoundsPerYear` times per year. Contributions are added evenly across
 * each compounding period before interest is applied for that period.
 */
export function calculateCompoundInterest(
  principal: number,
  annualRatePercent: number,
  years: number,
  monthlyContribution: number,
  compoundsPerYear: number,
): CompoundInterestResult | null {
  if (!Number.isFinite(principal) || principal < 0) return null;
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) return null;
  if (!Number.isFinite(years) || years <= 0 || !Number.isInteger(years)) return null;
  if (!Number.isFinite(monthlyContribution) || monthlyContribution < 0) return null;
  if (!Number.isInteger(compoundsPerYear) || compoundsPerYear < 1) return null;

  const periodRate = annualRatePercent / 100 / compoundsPerYear;
  const contributionPerPeriod = (monthlyContribution * 12) / compoundsPerYear;

  let balance = principal;
  let totalContributed = principal;
  const yearly: CompoundInterestYear[] = [];

  for (let year = 1; year <= years; year++) {
    let yearContributed = 0;
    let yearInterest = 0;
    for (let period = 0; period < compoundsPerYear; period++) {
      balance += contributionPerPeriod;
      yearContributed += contributionPerPeriod;
      const interest = balance * periodRate;
      balance += interest;
      yearInterest += interest;
    }
    totalContributed += yearContributed;
    yearly.push({
      year,
      contributed: round2(yearContributed),
      interest: round2(yearInterest),
      balance: round2(balance),
    });
  }

  return {
    finalBalance: round2(balance),
    totalContributed: round2(totalContributed),
    totalInterest: round2(balance - totalContributed),
    yearly,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
