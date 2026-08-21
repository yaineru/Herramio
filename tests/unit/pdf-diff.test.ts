import { describe, it, expect } from "vitest";
import { diffWords } from "@/lib/pdf/pdf-diff";

describe("diffWords", () => {
  it("marks everything equal for identical text", () => {
    const result = diffWords("hola mundo", "hola mundo");
    expect(result.every((t) => t.type === "equal")).toBe(true);
  });

  it("detects an added word", () => {
    const result = diffWords("hola mundo", "hola gran mundo");
    const added = result.filter((t) => t.type === "added").map((t) => t.value);
    expect(added).toContain("gran");
  });

  it("detects a removed word", () => {
    const result = diffWords("hola gran mundo", "hola mundo");
    const removed = result.filter((t) => t.type === "removed").map((t) => t.value);
    expect(removed).toContain("gran");
  });

  it("detects a replaced word as one removed + one added", () => {
    const result = diffWords("el gato duerme", "el perro duerme");
    const removed = result.filter((t) => t.type === "removed").map((t) => t.value);
    const added = result.filter((t) => t.type === "added").map((t) => t.value);
    expect(removed).toContain("gato");
    expect(added).toContain("perro");
  });

  it("rebuilds the original text when joined back together", () => {
    const a = "uno dos tres";
    const b = "uno dos tres";
    const result = diffWords(a, b);
    expect(result.map((t) => t.value).join("")).toBe(a);
  });

  it("handles an empty string on either side", () => {
    expect(diffWords("", "hola").every((t) => t.type === "added" || t.value.trim() === "")).toBe(true);
    expect(diffWords("hola", "").every((t) => t.type === "removed" || t.value.trim() === "")).toBe(true);
  });
});
