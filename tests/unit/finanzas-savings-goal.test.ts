import { describe, it, expect } from "vitest";
import { calculateSavingsGoal } from "@/lib/finanzas/savings-goal";

describe("calculateSavingsGoal", () => {
  it("divides evenly across months at 0% interest", () => {
    const result = calculateSavingsGoal(12000, 0, 12, 0);
    expect(result?.monthlyContribution).toBe(1000);
    expect(result?.alreadyReached).toBe(false);
  });

  it("accounts for existing savings reducing the needed contribution", () => {
    const result = calculateSavingsGoal(12000, 6000, 12, 0);
    expect(result?.monthlyContribution).toBe(500);
  });

  it("computes a lower contribution when interest helps growth", () => {
    const result = calculateSavingsGoal(10000, 0, 12, 12);
    expect(result?.monthlyContribution).toBeCloseTo(788.49, 1);
  });

  it("reports the goal as already reached when current savings alone suffice", () => {
    const result = calculateSavingsGoal(1000, 2000, 12, 0);
    expect(result?.alreadyReached).toBe(true);
    expect(result?.monthlyContribution).toBe(0);
  });

  it("rejects a non-positive target or non-integer months", () => {
    expect(calculateSavingsGoal(0, 0, 12, 0)).toBeNull();
    expect(calculateSavingsGoal(1000, 0, 12.5, 0)).toBeNull();
  });
});
