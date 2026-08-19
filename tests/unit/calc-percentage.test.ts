import { describe, it, expect } from "vitest";
import {
  percentOf,
  whatPercent,
  increaseByPercent,
  decreaseByPercent,
  calculatePercentage,
} from "@/lib/calculators/percentage";

describe("percentOf", () => {
  it("computes 20% of 500 = 100", () => {
    expect(percentOf(20, 500)).toBe(100);
  });
  it("handles decimals", () => {
    expect(percentOf(12.5, 80)).toBeCloseTo(10, 5);
  });
  it("handles 0%", () => {
    expect(percentOf(0, 500)).toBe(0);
  });
});

describe("whatPercent", () => {
  it("computes 50 of 200 = 25%", () => {
    expect(whatPercent(50, 200)).toBe(25);
  });
  it("returns null for division by zero", () => {
    expect(whatPercent(50, 0)).toBeNull();
  });
  it("handles part greater than base (over 100%)", () => {
    expect(whatPercent(300, 200)).toBe(150);
  });
});

describe("increaseByPercent", () => {
  it("computes 500 + 20% = 600", () => {
    expect(increaseByPercent(500, 20)).toBe(600);
  });
  it("handles negative percent as a decrease", () => {
    expect(increaseByPercent(500, -20)).toBe(400);
  });
});

describe("decreaseByPercent", () => {
  it("computes 500 - 20% = 400", () => {
    expect(decreaseByPercent(500, 20)).toBe(400);
  });
  it("handles 100% decrease", () => {
    expect(decreaseByPercent(500, 100)).toBe(0);
  });
});

describe("calculatePercentage", () => {
  it("returns null for NaN input", () => {
    expect(calculatePercentage("of", NaN, 500)).toBeNull();
  });
  it("returns null for isWhatPercent with base 0", () => {
    expect(calculatePercentage("isWhatPercent", 10, 0)).toBeNull();
  });
  it("returns a formula string for each mode", () => {
    expect(calculatePercentage("of", 20, 500)?.value).toBe(100);
    expect(calculatePercentage("increase", 500, 20)?.value).toBe(600);
    expect(calculatePercentage("decrease", 500, 20)?.value).toBe(400);
  });
});
