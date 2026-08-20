import { describe, it, expect } from "vitest";
import { TOOLS, isLocalProcessing, getToolById } from "@/lib/tools/registry";

describe("isLocalProcessing", () => {
  it("treats a tool with no processing field as local", () => {
    const tool = getToolById("calc-porcentaje");
    expect(tool).toBeDefined();
    expect(isLocalProcessing(tool!)).toBe(true);
  });

  it("treats conv-moneda as the one external exception", () => {
    const tool = getToolById("conv-moneda");
    expect(tool).toBeDefined();
    expect(isLocalProcessing(tool!)).toBe(false);
  });

  it("has exactly one external tool in the whole registry", () => {
    const externalTools = TOOLS.filter((t) => !isLocalProcessing(t));
    expect(externalTools.map((t) => t.id)).toEqual(["conv-moneda"]);
  });
});
