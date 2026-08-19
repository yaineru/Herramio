import { describe, it, expect } from "vitest";
import { parseEntries, shuffle, pickRandom } from "@/lib/productivity/raffle";

describe("parseEntries", () => {
  it("splits lines and trims whitespace", () => {
    expect(parseEntries("  Ana \n Beto\n\nCarla  ")).toEqual(["Ana", "Beto", "Carla"]);
  });
  it("removes empty lines", () => {
    expect(parseEntries("a\n\n\nb")).toEqual(["a", "b"]);
  });
  it("returns an empty array for blank input", () => {
    expect(parseEntries("   \n  \n")).toEqual([]);
  });
});

describe("shuffle", () => {
  it("returns an array with the same elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(5);
    expect([...result].sort()).toEqual([...input].sort());
  });
  it("does not mutate the input array", () => {
    const input = [1, 2, 3];
    shuffle(input);
    expect(input).toEqual([1, 2, 3]);
  });
});

describe("pickRandom", () => {
  it("returns null for an empty array", () => {
    expect(pickRandom([])).toBeNull();
  });
  it("returns an element from the array", () => {
    const items = ["a", "b", "c"];
    expect(items).toContain(pickRandom(items));
  });
  it("returns the only element for a single-item array", () => {
    expect(pickRandom(["solo"])).toBe("solo");
  });
});
