export interface LoanScheduleRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  schedule: LoanScheduleRow[];
}

/** Standard fixed-rate amortized loan (equal monthly payments). */
export function calculateLoan(principal: number, annualRatePercent: number, months: number): LoanResult | null {
  if (!Number.isFinite(principal) || principal <= 0) return null;
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) return null;
  if (!Number.isInteger(months) || months <= 0) return null;

  const monthlyRate = annualRatePercent / 100 / 12;
  const monthlyPayment =
    monthlyRate === 0 ? principal / months : (principal * monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1);

  let balance = principal;
  const schedule: LoanScheduleRow[] = [];
  for (let month = 1; month <= months; month++) {
    const interest = balance * monthlyRate;
    let principalPaid = monthlyPayment - interest;
    if (month === months) principalPaid = balance; // absorb rounding drift on the final payment
    balance = Math.max(0, balance - principalPaid);
    schedule.push({
      month,
      payment: round2(month === months ? principalPaid + interest : monthlyPayment),
      principal: round2(principalPaid),
      interest: round2(interest),
      balance: round2(balance),
    });
  }

  const totalPaid = schedule.reduce((sum, row) => sum + row.payment, 0);
  return {
    monthlyPayment: round2(monthlyPayment),
    totalPaid: round2(totalPaid),
    totalInterest: round2(totalPaid - principal),
    schedule,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
