import { describe, it, expect } from "vitest";
import { convertSalary } from "@/lib/finanzas/salary-converter";

describe("convertSalary", () => {
  it("converts an hourly rate to annual/monthly with a standard 40h week", () => {
    const result = convertSalary(20, "hourly", 8, 5);
    expect(result).not.toBeNull();
    expect(result?.annual).toBe(41600); // 20 * 40 * 52
    expect(result?.monthly).toBeCloseTo(3466.67, 1);
    expect(result?.hourly).toBe(20);
  });

  it("converts a monthly salary down to hourly", () => {
    const result = convertSalary(3000, "monthly", 8, 5);
    expect(result?.annual).toBe(36000);
    expect(result?.hourly).toBeCloseTo(17.31, 1);
  });

  it("converts an annual salary to daily", () => {
    const result = convertSalary(52000, "annual", 8, 5);
    expect(result?.daily).toBe(200); // 52000 / (5*52)
  });

  it("rejects negative amounts", () => {
    expect(convertSalary(-100, "hourly", 8, 5)).toBeNull();
  });

  it("rejects a zero-hour work day", () => {
    expect(convertSalary(20, "hourly", 0, 5)).toBeNull();
  });
});
