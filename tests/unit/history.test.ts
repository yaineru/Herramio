import { describe, it, expect, beforeEach } from "vitest";
import { getHistory, addToHistory, clearHistory } from "@/lib/history";

describe("history", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty", () => {
    expect(getHistory()).toEqual([]);
  });

  it("adds an entry with slug, name and timestamp", () => {
    addToHistory("calc-porcentaje", "Calculadora de Porcentaje", 1000);
    expect(getHistory()).toEqual([{ slug: "calc-porcentaje", name: "Calculadora de Porcentaje", timestamp: 1000 }]);
  });

  it("moves a re-visited tool to the front instead of duplicating it", () => {
    addToHistory("a", "Tool A", 1000);
    addToHistory("b", "Tool B", 2000);
    addToHistory("a", "Tool A", 3000);
    const history = getHistory();
    expect(history).toHaveLength(2);
    expect(history[0]).toEqual({ slug: "a", name: "Tool A", timestamp: 3000 });
  });

  it("caps history at 12 entries, dropping the oldest", () => {
    for (let i = 0; i < 15; i++) {
      addToHistory(`tool-${i}`, `Tool ${i}`, i);
    }
    const history = getHistory();
    expect(history).toHaveLength(12);
    expect(history[0].slug).toBe("tool-14");
    expect(history.map((h) => h.slug)).not.toContain("tool-0");
  });

  it("clears all history", () => {
    addToHistory("a", "Tool A");
    clearHistory();
    expect(getHistory()).toEqual([]);
  });

  it("ignores corrupted localStorage data", () => {
    window.localStorage.setItem("herramio-history", "{not valid json");
    expect(getHistory()).toEqual([]);
  });

  it("only ever stores slug, name and timestamp fields", () => {
    addToHistory("a", "Tool A", 1000);
    const raw = window.localStorage.getItem("herramio-history");
    const parsed = JSON.parse(raw!);
    expect(Object.keys(parsed[0]).sort()).toEqual(["name", "slug", "timestamp"]);
  });
});
