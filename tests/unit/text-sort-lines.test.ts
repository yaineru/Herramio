import { describe, it, expect } from "vitest";
import { processLines } from "@/lib/text/sort-lines";

describe("processLines", () => {
  it("sorts lines ascending", () => {
    const result = processLines("banana\napple\ncherry", { sort: "asc", dedupe: false, removeEmpty: false });
    expect(result).toBe("apple\nbanana\ncherry");
  });

  it("sorts lines descending", () => {
    const result = processLines("banana\napple\ncherry", { sort: "desc", dedupe: false, removeEmpty: false });
    expect(result).toBe("cherry\nbanana\napple");
  });

  it("removes duplicate lines, keeping the first occurrence", () => {
    const result = processLines("a\nb\na\nc\nb", { sort: "none", dedupe: true, removeEmpty: false });
    expect(result).toBe("a\nb\nc");
  });

  it("removes empty lines", () => {
    const result = processLines("a\n\nb\n   \nc", { sort: "none", dedupe: false, removeEmpty: true });
    expect(result).toBe("a\nb\nc");
  });

  it("combines removeEmpty, dedupe and sort together", () => {
    const result = processLines("b\n\na\nb\n\na", { sort: "asc", dedupe: true, removeEmpty: true });
    expect(result).toBe("a\nb");
  });

  it("normalizes CRLF and CR line endings", () => {
    const result = processLines("a\r\nb\rc", { sort: "none", dedupe: false, removeEmpty: false });
    expect(result).toBe("a\nb\nc");
  });

  it("does nothing when all options are off", () => {
    const result = processLines("c\nb\na", { sort: "none", dedupe: false, removeEmpty: false });
    expect(result).toBe("c\nb\na");
  });
});
