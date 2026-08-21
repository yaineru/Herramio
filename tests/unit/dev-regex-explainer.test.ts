import { describe, it, expect } from "vitest";
import { explainRegex } from "@/lib/dev/regex-explainer";

describe("explainRegex", () => {
  it("explains anchors", () => {
    const tokens = explainRegex("^$");
    expect(tokens[0].description).toContain("inicio");
    expect(tokens[1].description).toContain("final");
  });

  it("explains a digit escape with a quantifier", () => {
    const tokens = explainRegex("\\d+");
    expect(tokens).toHaveLength(1);
    expect(tokens[0].description).toContain("dígito");
    expect(tokens[0].description).toContain("una o más veces");
  });

  it("explains a character class", () => {
    const tokens = explainRegex("[a-z]");
    expect(tokens[0].description).toContain("a-z");
  });

  it("explains a negated character class", () => {
    const tokens = explainRegex("[^0-9]");
    expect(tokens[0].description).toContain("EXCEPTO");
  });

  it("explains a literal character", () => {
    const tokens = explainRegex("a");
    expect(tokens[0].raw).toBe("a");
    expect(tokens[0].description).toContain('"a"');
  });

  it("explains an exact-count quantifier", () => {
    const tokens = explainRegex("a{3}");
    expect(tokens[0].description).toContain("exactamente 3 veces");
  });

  it("explains a range quantifier", () => {
    const tokens = explainRegex("a{2,4}");
    expect(tokens[0].description).toContain("entre 2 y 4 veces");
  });

  it("explains an open-ended quantifier", () => {
    const tokens = explainRegex("a{2,}");
    expect(tokens[0].description).toContain("2 o más veces");
  });

  it("explains alternation", () => {
    const tokens = explainRegex("a|b");
    expect(tokens.some((t) => t.description.includes("alternancia"))).toBe(true);
  });

  it("explains a capturing group with its contents", () => {
    const tokens = explainRegex("(abc)");
    expect(tokens[0].description).toContain("grupo");
    expect(tokens[0].description).toContain("contiene");
  });

  it("explains a named group", () => {
    const tokens = explainRegex("(?<year>\\d{4})");
    expect(tokens[0].description).toContain('"year"');
  });

  it("handles a realistic email-ish pattern without throwing", () => {
    expect(() => explainRegex("^[\\w.-]+@[\\w.-]+\\.\\w+$")).not.toThrow();
  });
});
