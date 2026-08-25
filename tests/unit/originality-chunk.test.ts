import { describe, it, expect } from "vitest";
import { chunkText } from "@/lib/originality/chunk";

describe("chunkText", () => {
  it("splits on blank lines into one chunk per paragraph", () => {
    const chunks = chunkText("First paragraph.\n\nSecond paragraph.\n\nThird paragraph.");
    expect(chunks).toHaveLength(3);
    expect(chunks.map((c) => c.text)).toEqual(["First paragraph.", "Second paragraph.", "Third paragraph."]);
  });

  it("assigns sequential, zero-based sequence numbers", () => {
    const chunks = chunkText("A.\n\nB.\n\nC.");
    expect(chunks.map((c) => c.sequence)).toEqual([0, 1, 2]);
  });

  it("drops empty paragraphs from stray blank lines", () => {
    const chunks = chunkText("First.\n\n\n\nSecond.");
    expect(chunks).toHaveLength(2);
  });

  it("computes word count per chunk", () => {
    const chunks = chunkText("one two three four five");
    expect(chunks[0].wordCount).toBe(5);
  });

  it("also produces a normalized_text alongside the raw text", () => {
    const chunks = chunkText("Hello   World");
    expect(chunks[0].text).toBe("Hello   World".replace(/\s+/g, " "));
    expect(chunks[0].normalizedText).toBe("hello world");
  });

  it("splits an overlong single paragraph into multiple chunks rather than one giant one", () => {
    const longParagraph = Array.from({ length: 60 }, (_, i) => `This is sentence number ${i}.`).join(" ");
    const chunks = chunkText(longParagraph);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.wordCount).toBeLessThanOrEqual(230); // small slack over the 220-word cap for the sentence that pushed it over
    }
  });

  it("returns nothing for empty input", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText("   \n\n  ")).toEqual([]);
  });
});
