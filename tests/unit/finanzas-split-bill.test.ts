import { describe, it, expect } from "vitest";
import { splitBill } from "@/lib/finanzas/split-bill";

describe("splitBill", () => {
  it("splits a subtotal with tip evenly among people", () => {
    const result = splitBill(100, 10, 5);
    expect(result?.tipAmount).toBeCloseTo(10);
    expect(result?.totalWithTip).toBeCloseTo(110);
    expect(result?.perPerson).toBeCloseTo(22);
  });

  it("works with a 0% tip", () => {
    const result = splitBill(90, 0, 3);
    expect(result?.perPerson).toBeCloseTo(30);
  });

  it("rejects a negative subtotal", () => {
    expect(splitBill(-1, 10, 2)).toBeNull();
  });

  it("rejects a non-integer number of people", () => {
    expect(splitBill(100, 10, 2.5)).toBeNull();
  });

  it("rejects fewer than 1 person", () => {
    expect(splitBill(100, 10, 0)).toBeNull();
  });

  it("rejects non-finite input", () => {
    expect(splitBill(NaN, 10, 2)).toBeNull();
  });
});
