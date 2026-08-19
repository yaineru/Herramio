import { describe, it, expect } from "vitest";
import { calculateDateDiff } from "@/lib/calculators/date-diff";

describe("calculateDateDiff", () => {
  it("computes total days between two dates", () => {
    const result = calculateDateDiff(new Date(2026, 0, 1), new Date(2026, 0, 11));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.totalDays).toBe(10);
  });

  it("computes weeks and remainder days", () => {
    const result = calculateDateDiff(new Date(2026, 0, 1), new Date(2026, 0, 16));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.weeks).toBe(2);
      expect(result.value.remainderDays).toBe(1);
    }
  });

  it("works regardless of which date is passed first", () => {
    const a = calculateDateDiff(new Date(2026, 0, 1), new Date(2026, 0, 11));
    const b = calculateDateDiff(new Date(2026, 0, 11), new Date(2026, 0, 1));
    expect(a).toEqual(b);
  });

  it("returns 0 for the same date", () => {
    const result = calculateDateDiff(new Date(2026, 0, 1), new Date(2026, 0, 1));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.totalDays).toBe(0);
  });

  it("computes a calendar-aware years/months/days breakdown", () => {
    const result = calculateDateDiff(new Date(2024, 0, 15), new Date(2026, 2, 20));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.years).toBe(2);
      expect(result.value.months).toBe(2);
      expect(result.value.days).toBe(5);
    }
  });

  it("rejects invalid dates", () => {
    expect(calculateDateDiff(new Date("bad"), new Date()).ok).toBe(false);
    expect(calculateDateDiff(new Date(), new Date("bad")).ok).toBe(false);
  });
});
