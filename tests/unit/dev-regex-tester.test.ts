import { describe, it, expect } from "vitest";
import { testRegex } from "@/lib/dev/regex-tester";

describe("testRegex", () => {
  it("finds all matches with capture groups", () => {
    const result = testRegex("(\\w+)@(\\w+\\.com)", "", "a@x.com b@y.com");
    expect(result.ok).toBe(true);
    expect(result.matches).toHaveLength(2);
    expect(result.matches[0].match).toBe("a@x.com");
    expect(result.matches[0].groups).toEqual(["a", "x.com"]);
  });

  it("returns ok:false with an error message for invalid patterns", () => {
    const result = testRegex("(unterminated", "", "text");
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("rejects input text over the length cap", () => {
    const longText = "a".repeat(20_001);
    const result = testRegex("a", "", longText);
    expect(result.ok).toBe(false);
  });

  it("caps the number of matches and reports truncation", () => {
    const text = "a".repeat(1000);
    const result = testRegex("a", "", text);
    expect(result.ok).toBe(true);
    expect(result.matches.length).toBeLessThanOrEqual(500);
    expect(result.truncated).toBe(true);
  });

  it("handles zero-width matches without infinite looping", () => {
    const result = testRegex("a*", "", "bbb");
    expect(result.ok).toBe(true);
    expect(result.matches.length).toBeGreaterThan(0);
  });
});
