import { describe, it, expect } from "vitest";
import { calculateLoan } from "@/lib/finanzas/loan";

describe("calculateLoan", () => {
  it("computes a standard amortized monthly payment", () => {
    const result = calculateLoan(10000, 12, 12);
    expect(result).not.toBeNull();
    expect(result?.monthlyPayment).toBeCloseTo(888.49, 1);
    expect(result?.schedule).toHaveLength(12);
  });

  it("handles a 0% interest loan as a plain division", () => {
    const result = calculateLoan(1200, 0, 12);
    expect(result?.monthlyPayment).toBe(100);
    expect(result?.totalInterest).toBe(0);
    expect(result?.totalPaid).toBe(1200);
  });

  it("pays off the full balance by the last installment", () => {
    const result = calculateLoan(5000, 8, 24);
    expect(result?.schedule[23].balance).toBe(0);
  });

  it("produces a decreasing balance over the schedule", () => {
    const result = calculateLoan(5000, 8, 6);
    const balances = result!.schedule.map((r) => r.balance);
    for (let i = 1; i < balances.length; i++) {
      expect(balances[i]).toBeLessThanOrEqual(balances[i - 1]);
    }
  });

  it("rejects a non-positive principal", () => {
    expect(calculateLoan(0, 5, 12)).toBeNull();
    expect(calculateLoan(-100, 5, 12)).toBeNull();
  });

  it("rejects a non-integer or non-positive term", () => {
    expect(calculateLoan(1000, 5, 0)).toBeNull();
    expect(calculateLoan(1000, 5, 12.5)).toBeNull();
  });
});
