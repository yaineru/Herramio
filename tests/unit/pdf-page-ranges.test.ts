import { describe, it, expect } from "vitest";
import { parsePageRange, parsePageGroups } from "@/lib/pdf/page-ranges";

describe("parsePageRange", () => {
  it("parses a simple range", () => {
    expect(parsePageRange("1-3", 10)).toEqual([0, 1, 2]);
  });
  it("parses a single page", () => {
    expect(parsePageRange("5", 10)).toEqual([4]);
  });
  it("rejects a range starting below 1", () => {
    expect(parsePageRange("0-3", 10)).toBeNull();
  });
  it("rejects a range exceeding the max page", () => {
    expect(parsePageRange("8-12", 10)).toBeNull();
  });
  it("rejects an inverted range", () => {
    expect(parsePageRange("5-2", 10)).toBeNull();
  });
  it("rejects garbage input", () => {
    expect(parsePageRange("abc", 10)).toBeNull();
    expect(parsePageRange("", 10)).toBeNull();
  });
  it("handles whitespace around the dash", () => {
    expect(parsePageRange(" 2 - 4 ", 10)).toEqual([1, 2, 3]);
  });
});

describe("parsePageGroups", () => {
  it("parses multiple comma-separated groups", () => {
    expect(parsePageGroups("1-3,5,8-9", 10)).toEqual([[0, 1, 2], [4], [7, 8]]);
  });
  it("returns null if any group is invalid", () => {
    expect(parsePageGroups("1-3,99", 10)).toBeNull();
  });
  it("returns null for empty input", () => {
    expect(parsePageGroups("", 10)).toBeNull();
    expect(parsePageGroups("   ", 10)).toBeNull();
  });
  it("ignores extra whitespace and empty segments", () => {
    expect(parsePageGroups("1-2, , 4", 10)).toEqual([[0, 1], [3]]);
  });
});
