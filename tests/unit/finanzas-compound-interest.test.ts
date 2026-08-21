import { describe, it, expect } from "vitest";
import { calculateCompoundInterest } from "@/lib/finanzas/compound-interest";

describe("calculateCompoundInterest", () => {
  it("computes simple growth with no contributions and 0% rate (identity check)", () => {
    const result = calculateCompoundInterest(1000, 0, 2, 0, 12);
    expect(result).not.toBeNull();
    expect(result?.finalBalance).toBe(1000);
    expect(result?.totalInterest).toBe(0);
    expect(result?.yearly).toHaveLength(2);
  });

  it("adds monthly contributions correctly at 0% interest", () => {
    const result = calculateCompoundInterest(1000, 0, 2, 100, 12);
    expect(result?.totalContributed).toBe(3400); // 1000 principal + 100*24 months
    expect(result?.finalBalance).toBe(3400);
    expect(result?.totalInterest).toBe(0);
  });

  it("compounds interest monthly on a lump sum", () => {
    const result = calculateCompoundInterest(1000, 12, 1, 0, 12);
    expect(result?.finalBalance).toBeCloseTo(1126.83, 1);
    expect(result?.totalContributed).toBe(1000);
  });

  it("produces one yearly breakdown row per year with a growing balance", () => {
    const result = calculateCompoundInterest(1000, 5, 3, 0, 1);
    expect(result?.yearly.map((y) => y.year)).toEqual([1, 2, 3]);
    expect(result!.yearly[2].balance).toBeGreaterThan(result!.yearly[0].balance);
  });

  it("rejects negative principal", () => {
    expect(calculateCompoundInterest(-100, 5, 1, 0, 12)).toBeNull();
  });

  it("rejects zero or non-integer years", () => {
    expect(calculateCompoundInterest(1000, 5, 0, 0, 12)).toBeNull();
    expect(calculateCompoundInterest(1000, 5, 1.5, 0, 12)).toBeNull();
  });

  it("rejects an invalid compounding frequency", () => {
    expect(calculateCompoundInterest(1000, 5, 1, 0, 0)).toBeNull();
  });
});
