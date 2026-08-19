import { describe, it, expect } from "vitest";
import { getTextStats } from "@/lib/text/word-stats";

describe("getTextStats", () => {
  it("handles empty text", () => {
    const stats = getTextStats("");
    expect(stats).toEqual({
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      lines: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
    });
  });

  it("counts a simple sentence", () => {
    const stats = getTextStats("Hola mundo, esto es una prueba.");
    expect(stats.words).toBe(6);
    expect(stats.characters).toBe(31);
    expect(stats.lines).toBe(1);
    expect(stats.paragraphs).toBe(1);
  });

  it("collapses multiple spaces when counting words", () => {
    const stats = getTextStats("uno   dos    tres");
    expect(stats.words).toBe(3);
  });

  it("counts lines separated by newlines", () => {
    const stats = getTextStats("línea uno\nlínea dos\nlínea tres");
    expect(stats.lines).toBe(3);
  });

  it("counts paragraphs separated by blank lines", () => {
    const stats = getTextStats("Primer párrafo.\n\nSegundo párrafo.\n\nTercero.");
    expect(stats.paragraphs).toBe(3);
  });

  it("counts characters without spaces separately", () => {
    const stats = getTextStats("a b c");
    expect(stats.characters).toBe(5);
    expect(stats.charactersNoSpaces).toBe(3);
  });

  it("estimates at least 1 minute of reading time for any non-empty text", () => {
    const stats = getTextStats("Un texto corto.");
    expect(stats.readingTimeMinutes).toBeGreaterThanOrEqual(1);
  });

  it("handles whitespace-only text as empty", () => {
    const stats = getTextStats("   \n\n   ");
    expect(stats.words).toBe(0);
    expect(stats.paragraphs).toBe(0);
  });
});
