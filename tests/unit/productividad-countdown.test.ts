import { describe, it, expect } from "vitest";
import { computeCountdown } from "@/lib/productividad/countdown";

describe("computeCountdown", () => {
  it("breaks down a future date into days/hours/minutes/seconds", () => {
    const now = new Date(2026, 0, 1, 0, 0, 0);
    const target = new Date(2026, 0, 3, 5, 30, 15); // 2 days, 5h, 30m, 15s later
    const result = computeCountdown(target, now);
    expect(result.isPast).toBe(false);
    expect(result.days).toBe(2);
    expect(result.hours).toBe(5);
    expect(result.minutes).toBe(30);
    expect(result.seconds).toBe(15);
  });

  it("marks a past date as isPast with a positive breakdown", () => {
    const now = new Date(2026, 0, 3, 0, 0, 0);
    const target = new Date(2026, 0, 1, 0, 0, 0); // 2 days earlier
    const result = computeCountdown(target, now);
    expect(result.isPast).toBe(true);
    expect(result.days).toBe(2);
    expect(result.totalMs).toBeLessThan(0);
  });

  it("returns all zeros for the exact same instant", () => {
    const now = new Date(2026, 0, 1, 12, 0, 0);
    const result = computeCountdown(now, now);
    expect(result).toMatchObject({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });
  });
});
