import { describe, it, expect } from "vitest";
import { parsePageOrder } from "@/lib/pdf/page-ranges";

describe("parsePageOrder", () => {
  it("parses a simple reordering", () => {
    expect(parsePageOrder("3,1,2", 3)).toEqual([2, 0, 1]);
  });

  it("allows repeated page numbers for duplication", () => {
    expect(parsePageOrder("1,1,2", 3)).toEqual([0, 0, 1]);
  });

  it("rejects a page number out of range", () => {
    expect(parsePageOrder("1,4", 3)).toBeNull();
  });

  it("rejects zero or negative page numbers", () => {
    expect(parsePageOrder("0,1", 3)).toBeNull();
  });

  it("rejects ranges (only single numbers are valid here)", () => {
    expect(parsePageOrder("1-3", 3)).toBeNull();
  });

  it("rejects empty input", () => {
    expect(parsePageOrder("", 3)).toBeNull();
    expect(parsePageOrder("   ", 3)).toBeNull();
  });
});
