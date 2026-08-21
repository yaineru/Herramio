export type SalaryPeriod = "hourly" | "daily" | "monthly" | "annual";

export interface SalaryBreakdown {
  hourly: number;
  daily: number;
  monthly: number;
  annual: number;
}

const WEEKS_PER_YEAR = 52;

/** Converts a salary amount in any period into all four periods, given a weekly work schedule. */
export function convertSalary(
  amount: number,
  fromPeriod: SalaryPeriod,
  hoursPerDay: number,
  daysPerWeek: number,
): SalaryBreakdown | null {
  if (!Number.isFinite(amount) || amount < 0) return null;
  if (!Number.isFinite(hoursPerDay) || hoursPerDay <= 0) return null;
  if (!Number.isFinite(daysPerWeek) || daysPerWeek <= 0) return null;

  const hoursPerWeek = hoursPerDay * daysPerWeek;
  let annual: number;
  switch (fromPeriod) {
    case "hourly":
      annual = amount * hoursPerWeek * WEEKS_PER_YEAR;
      break;
    case "daily":
      annual = amount * daysPerWeek * WEEKS_PER_YEAR;
      break;
    case "monthly":
      annual = amount * 12;
      break;
    case "annual":
      annual = amount;
      break;
  }

  const weeksPerYear = WEEKS_PER_YEAR;
  return {
    hourly: round2(annual / (hoursPerWeek * weeksPerYear)),
    daily: round2(annual / (daysPerWeek * weeksPerYear)),
    monthly: round2(annual / 12),
    annual: round2(annual),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
