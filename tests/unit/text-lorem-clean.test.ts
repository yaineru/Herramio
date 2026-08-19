import { describe, it, expect } from "vitest";
import { generateLoremIpsum } from "@/lib/text/lorem-ipsum";
import { cleanText } from "@/lib/text/clean-text";

describe("generateLoremIpsum", () => {
  it("generates the requested number of words", () => {
    const result = generateLoremIpsum(10, "palabras");
    const words = result.replace(/\.$/, "").split(" ");
    expect(words.length).toBe(10);
  });
  it("generates the requested number of sentences", () => {
    const result = generateLoremIpsum(3, "oraciones");
    const sentences = result.split(". ").filter(Boolean);
    expect(sentences.length).toBe(3);
  });
  it("generates the requested number of paragraphs", () => {
    const result = generateLoremIpsum(2, "parrafos");
    const paragraphs = result.split("\n\n").filter(Boolean);
    expect(paragraphs.length).toBe(2);
  });
  it("clamps count to a reasonable maximum", () => {
    const result = generateLoremIpsum(10000, "palabras");
    const words = result.replace(/\.$/, "").split(" ");
    expect(words.length).toBeLessThanOrEqual(500);
  });
  it("clamps count to a minimum of 1", () => {
    const result = generateLoremIpsum(0, "palabras");
    expect(result.length).toBeGreaterThan(0);
  });
  it("starts with classic Lorem ipsum text when requested", () => {
    const result = generateLoremIpsum(5, "palabras", true);
    expect(result.toLowerCase().startsWith("lorem ipsum")).toBe(true);
  });
});

describe("cleanText", () => {
  const noop = { removeDuplicateSpaces: false, removeEmptyLines: false, trimLines: false, textCase: "none" as const };

  it("removes duplicate spaces", () => {
    const result = cleanText("hola    mundo", { ...noop, removeDuplicateSpaces: true });
    expect(result).toBe("hola mundo");
  });

  it("removes empty lines", () => {
    const result = cleanText("linea 1\n\n\nlinea 2", { ...noop, removeEmptyLines: true });
    expect(result).toBe("linea 1\nlinea 2");
  });

  it("trims each line", () => {
    const result = cleanText("  hola  \n  mundo  ", { ...noop, trimLines: true });
    expect(result).toBe("hola\nmundo");
  });

  it("converts to uppercase", () => {
    expect(cleanText("hola mundo", { ...noop, textCase: "upper" })).toBe("HOLA MUNDO");
  });

  it("converts to lowercase", () => {
    expect(cleanText("HOLA MUNDO", { ...noop, textCase: "lower" })).toBe("hola mundo");
  });

  it("converts to title case", () => {
    expect(cleanText("hola mundo bonito", { ...noop, textCase: "title" })).toBe("Hola Mundo Bonito");
  });

  it("combines multiple operations", () => {
    const result = cleanText("  Hola   Mundo  \n\n  otra   linea  \n\n", {
      removeDuplicateSpaces: true,
      removeEmptyLines: true,
      trimLines: true,
      textCase: "lower",
    });
    expect(result).toBe("hola mundo\notra linea");
  });

  it("handles empty input", () => {
    expect(cleanText("", noop)).toBe("");
  });
});
