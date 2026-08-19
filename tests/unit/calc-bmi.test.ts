import { describe, it, expect } from "vitest";
import { calculateBmi } from "@/lib/calculators/bmi";

describe("calculateBmi", () => {
  it("computes a normal BMI correctly (70kg, 175cm)", () => {
    const result = calculateBmi(70, 175);
    expect(result).not.toBeNull();
    expect(result!.bmi).toBeCloseTo(22.86, 1);
    expect(result!.category).toBe("normal");
  });

  it("categorizes bajo peso", () => {
    const result = calculateBmi(50, 175);
    expect(result!.category).toBe("bajo-peso");
  });

  it("categorizes sobrepeso", () => {
    const result = calculateBmi(80, 175);
    expect(result!.category).toBe("sobrepeso");
  });

  it("categorizes obesidad", () => {
    const result = calculateBmi(100, 175);
    expect(result!.category).toBe("obesidad");
  });

  it("returns null for zero or negative weight", () => {
    expect(calculateBmi(0, 175)).toBeNull();
    expect(calculateBmi(-10, 175)).toBeNull();
  });

  it("returns null for zero or negative height", () => {
    expect(calculateBmi(70, 0)).toBeNull();
    expect(calculateBmi(70, -175)).toBeNull();
  });

  it("returns null for NaN input", () => {
    expect(calculateBmi(NaN, 175)).toBeNull();
  });

  it("handles boundary values correctly", () => {
    // 18.5 exactly should be "normal", not "bajo-peso"
    const heightM = 1.75;
    const weightAt18_5 = 18.5 * heightM * heightM;
    expect(calculateBmi(weightAt18_5, 175)!.category).toBe("normal");
  });
});
