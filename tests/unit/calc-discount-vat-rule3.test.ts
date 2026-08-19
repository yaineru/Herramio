import { describe, it, expect } from "vitest";
import { calculateDiscount } from "@/lib/calculators/discount";
import { addVat, removeVat } from "@/lib/calculators/vat";
import { calculateRuleOfThree } from "@/lib/calculators/rule-of-three";

describe("calculateDiscount", () => {
  it("computes 20% off 100", () => {
    const result = calculateDiscount(100, 20);
    expect(result).toEqual({ savings: 20, finalPrice: 80 });
  });
  it("handles 0% discount", () => {
    expect(calculateDiscount(100, 0)).toEqual({ savings: 0, finalPrice: 100 });
  });
  it("handles 100% discount", () => {
    expect(calculateDiscount(100, 100)).toEqual({ savings: 100, finalPrice: 0 });
  });
  it("returns null for negative price", () => {
    expect(calculateDiscount(-10, 20)).toBeNull();
  });
  it("returns null for NaN", () => {
    expect(calculateDiscount(NaN, 20)).toBeNull();
  });
});

describe("addVat", () => {
  it("adds 19% VAT to 100", () => {
    const result = addVat(100, 19);
    expect(result!.vatAmount).toBeCloseTo(19, 5);
    expect(result!.total).toBeCloseTo(119, 5);
  });
  it("returns null for negative base", () => {
    expect(addVat(-100, 19)).toBeNull();
  });
});

describe("removeVat", () => {
  it("extracts the base price from a VAT-inclusive total", () => {
    const result = removeVat(119, 19);
    expect(result!.base).toBeCloseTo(100, 5);
    expect(result!.vatAmount).toBeCloseTo(19, 5);
  });
  it("round-trips with addVat", () => {
    const added = addVat(250, 16)!;
    const removed = removeVat(added.total, 16)!;
    expect(removed.base).toBeCloseTo(250, 5);
  });
});

describe("calculateRuleOfThree", () => {
  it("solves a direct proportion: 5 is to 10 as 8 is to X", () => {
    expect(calculateRuleOfThree(5, 10, 8, "directa")).toBeCloseTo(16, 5);
  });
  it("solves an inverse proportion", () => {
    // 4 workers finish in 6 days; how many days for 8 workers? a=4,b=6,c=8 -> x=(4*6)/8=3
    expect(calculateRuleOfThree(4, 6, 8, "inversa")).toBeCloseTo(3, 5);
  });
  it("returns null when dividing by zero (a=0 in directa)", () => {
    expect(calculateRuleOfThree(0, 10, 8, "directa")).toBeNull();
  });
  it("returns null when dividing by zero (c=0 in inversa)", () => {
    expect(calculateRuleOfThree(4, 6, 0, "inversa")).toBeNull();
  });
  it("returns null for non-finite input", () => {
    expect(calculateRuleOfThree(NaN, 10, 8, "directa")).toBeNull();
  });
});
