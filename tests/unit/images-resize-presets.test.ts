import { describe, it, expect } from "vitest";
import { maintainAspectRatio } from "@/lib/images/resize-presets";

describe("maintainAspectRatio", () => {
  it("computes height from a new width for a landscape image", () => {
    // 1000x500 -> 2:1 ratio. New width 400 -> height 200.
    expect(maintainAspectRatio(1000, 500, "width", 400)).toBe(200);
  });

  it("computes width from a new height for a portrait image", () => {
    // 500x1000 -> 1:2 ratio. New height 400 -> width 200.
    expect(maintainAspectRatio(500, 1000, "height", 400)).toBe(200);
  });

  it("rounds to the nearest whole pixel", () => {
    expect(maintainAspectRatio(1000, 300, "width", 333)).toBe(100);
  });

  it("returns the input unchanged when original dimensions are invalid", () => {
    expect(maintainAspectRatio(0, 0, "width", 400)).toBe(400);
  });
});
