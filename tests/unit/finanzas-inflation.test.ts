import { describe, it, expect } from "vitest";
import { adjustForInflation } from "@/lib/finanzas/inflation";

describe("adjustForInflation", () => {
  it("computes the future equivalent amount under constant inflation", () => {
    // 1000 at 10% for 2 years -> 1000 * 1.1^2 = 1210
    const result = adjustForInflation(1000, 10, 2);
    expect(result?.adjustedAmount).toBe(1210);
    expect(result?.totalIncrease).toBe(210);
    expect(result?.totalIncreasePercent).toBe(21);
  });

  it("returns the same amount for 0 years", () => {
    const result = adjustForInflation(500, 5, 0);
    expect(result?.adjustedAmount).toBe(500);
    expect(result?.totalIncrease).toBe(0);
  });

  it("returns the same amount for 0% inflation", () => {
    const result = adjustForInflation(500, 0, 10);
    expect(result?.adjustedAmount).toBe(500);
  });

  it("rejects negative amount, rate or years", () => {
    expect(adjustForInflation(-100, 5, 1)).toBeNull();
    expect(adjustForInflation(100, -5, 1)).toBeNull();
    expect(adjustForInflation(100, 5, -1)).toBeNull();
  });
});
