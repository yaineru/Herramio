import { describe, it, expect } from "vitest";
import { hoursMinutesToDecimal, decimalToHoursMinutes, sumTimeEntries } from "@/lib/productividad/hours-decimal";

describe("hoursMinutesToDecimal", () => {
  it("converts 8:30 to 8.5", () => {
    expect(hoursMinutesToDecimal(8, 30)).toBe(8.5);
  });

  it("converts 7:15 to 7.25", () => {
    expect(hoursMinutesToDecimal(7, 15)).toBe(7.25);
  });

  it("rejects minutes >= 60", () => {
    expect(hoursMinutesToDecimal(8, 60)).toBeNull();
  });

  it("rejects negative values", () => {
    expect(hoursMinutesToDecimal(-1, 0)).toBeNull();
  });
});

describe("decimalToHoursMinutes", () => {
  it("converts 8.5 to 8h 30m", () => {
    expect(decimalToHoursMinutes(8.5)).toEqual({ hours: 8, minutes: 30 });
  });

  it("converts 7.25 to 7h 15m", () => {
    expect(decimalToHoursMinutes(7.25)).toEqual({ hours: 7, minutes: 15 });
  });

  it("carries a rounded 60 minutes into the next hour", () => {
    expect(decimalToHoursMinutes(8.999)).toEqual({ hours: 9, minutes: 0 });
  });

  it("rejects negative values", () => {
    expect(decimalToHoursMinutes(-1)).toBeNull();
  });
});

describe("sumTimeEntries", () => {
  it("sums multiple entries", () => {
    expect(sumTimeEntries([{ hours: 8, minutes: 30 }, { hours: 7, minutes: 45 }])).toBe(16.25);
  });

  it("returns null for an empty list", () => {
    expect(sumTimeEntries([])).toBeNull();
  });

  it("returns null if any entry is invalid", () => {
    expect(sumTimeEntries([{ hours: 8, minutes: 70 }])).toBeNull();
  });
});
