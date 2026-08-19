import { describe, it, expect, beforeEach } from "vitest";
import { getFavorites, isFavorite, toggleFavorite, getFavoritesSnapshot } from "@/lib/favorites";

describe("favorites", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts with no favorites", () => {
    expect(getFavorites()).toEqual([]);
  });

  it("adds a tool to favorites when toggled on", () => {
    const result = toggleFavorite("calc-porcentaje");
    expect(result).toBe(true);
    expect(getFavorites()).toEqual(["calc-porcentaje"]);
    expect(isFavorite("calc-porcentaje")).toBe(true);
  });

  it("removes a tool from favorites when toggled off", () => {
    toggleFavorite("calc-porcentaje");
    const result = toggleFavorite("calc-porcentaje");
    expect(result).toBe(false);
    expect(getFavorites()).toEqual([]);
    expect(isFavorite("calc-porcentaje")).toBe(false);
  });

  it("supports multiple favorites", () => {
    toggleFavorite("a");
    toggleFavorite("b");
    expect(getFavorites().sort()).toEqual(["a", "b"]);
  });

  it("ignores corrupted localStorage data", () => {
    window.localStorage.setItem("herramio-favorites", "not valid json");
    expect(getFavorites()).toEqual([]);
  });

  it("updates the snapshot string after a change", () => {
    const before = getFavoritesSnapshot();
    toggleFavorite("dev-uuid-generator");
    const after = getFavoritesSnapshot();
    expect(after).not.toBe(before);
  });
});
