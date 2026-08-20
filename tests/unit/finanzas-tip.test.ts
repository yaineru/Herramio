import { describe, it, expect } from "vitest";
import { calculateTip } from "@/lib/finanzas/tip";

describe("calculateTip", () => {
  it("calculates a 15% tip on a single bill", () => {
    const result = calculateTip(100, 15);
    expect(result?.tipAmount).toBeCloseTo(15);
    expect(result?.totalAmount).toBeCloseTo(115);
    expect(result?.perPersonTotal).toBeCloseTo(115);
  });

  it("splits the tip and total across people", () => {
    const result = calculateTip(200, 10, 4);
    expect(result?.tipAmount).toBeCloseTo(20);
    expect(result?.perPersonTip).toBeCloseTo(5);
    expect(result?.perPersonTotal).toBeCloseTo(55);
  });

  it("allows a 0% tip", () => {
    const result = calculateTip(50, 0);
    expect(result?.tipAmount).toBe(0);
    expect(result?.totalAmount).toBe(50);
  });

  it("rejects a negative bill", () => {
    expect(calculateTip(-10, 15)).toBeNull();
  });

  it("rejects a negative tip percent", () => {
    expect(calculateTip(50, -5)).toBeNull();
  });

  it("rejects fewer than 1 person", () => {
    expect(calculateTip(50, 15, 0)).toBeNull();
  });

  it("rejects non-finite input", () => {
    expect(calculateTip(NaN, 15)).toBeNull();
    expect(calculateTip(50, Infinity)).toBeNull();
  });
});
