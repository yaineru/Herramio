import { describe, it, expect } from "vitest";
import { normalizeText } from "@/lib/originality/normalize";

describe("normalizeText", () => {
  it("collapses whitespace and trims", () => {
    expect(normalizeText("  hello   world  \n\n ")).toBe("hello world");
  });

  it("lowercases", () => {
    expect(normalizeText("Artificial Intelligence")).toBe("artificial intelligence");
  });

  it("normalizes curly quotes and dashes to plain ASCII equivalents", () => {
    expect(normalizeText("“smart quotes” and – dashes —")).toBe('"smart quotes" and - dashes -');
    expect(normalizeText("it’s a test")).toBe("it's a test");
  });

  it("makes two documents that quote the same sentence with different quote/dash glyphs compare equal", () => {
    const withCurlyQuotesAndEmDash = normalizeText("The professor said “this is important”—really.");
    const withStraightQuotesAndHyphen = normalizeText('The professor said "this is important"-really.');
    expect(withCurlyQuotesAndEmDash).toBe(withStraightQuotesAndHyphen);
  });
});
