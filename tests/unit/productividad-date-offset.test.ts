import { describe, it, expect } from "vitest";
import { addToDate } from "@/lib/productividad/date-offset";

describe("addToDate", () => {
  it("adds days", () => {
    const result = addToDate(new Date(2026, 0, 1), 10, "days");
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(11);
  });

  it("adds weeks", () => {
    const result = addToDate(new Date(2026, 0, 1), 2, "weeks");
    expect(result.getDate()).toBe(15);
  });

  it("adds months and rolls over the year boundary", () => {
    const result = addToDate(new Date(2026, 10, 15), 3, "months");
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth()).toBe(1); // February
  });

  it("adds years", () => {
    const result = addToDate(new Date(2026, 0, 1), 5, "years");
    expect(result.getFullYear()).toBe(2031);
  });

  it("subtracts when given a negative amount", () => {
    const result = addToDate(new Date(2026, 0, 10), -15, "days");
    expect(result.getMonth()).toBe(11); // December (previous year)
    expect(result.getFullYear()).toBe(2025);
  });
});
