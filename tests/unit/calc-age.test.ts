import { describe, it, expect } from "vitest";
import { calculateAge } from "@/lib/calculators/age";

describe("calculateAge", () => {
  it("computes exact years for a birthday that already passed this year", () => {
    const result = calculateAge(new Date(1990, 0, 15), new Date(2026, 5, 1));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.years).toBe(36);
  });

  it("computes years correctly when the birthday hasn't happened yet this year", () => {
    const result = calculateAge(new Date(1990, 11, 25), new Date(2026, 0, 1));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.years).toBe(35);
  });

  it("rejects a future birth date", () => {
    const result = calculateAge(new Date(2030, 0, 1), new Date(2026, 0, 1));
    expect(result.ok).toBe(false);
  });

  it("rejects an invalid date", () => {
    const result = calculateAge(new Date("not a date"), new Date());
    expect(result.ok).toBe(false);
  });

  it("returns 0 years/months/days for someone born today", () => {
    const today = new Date(2026, 5, 15);
    const result = calculateAge(new Date(2026, 5, 15), today);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.years).toBe(0);
      expect(result.value.months).toBe(0);
      expect(result.value.days).toBe(0);
    }
  });

  it("computes days until the next birthday", () => {
    const result = calculateAge(new Date(1990, 5, 20), new Date(2026, 5, 15));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.daysUntilNextBirthday).toBe(5);
  });
});
