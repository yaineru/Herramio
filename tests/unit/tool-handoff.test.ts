import { describe, it, expect, beforeEach } from "vitest";
import { setToolHandoff, consumeToolHandoff } from "@/lib/tool-handoff";

function makeFile(name = "test.png"): File {
  return new File([new Uint8Array([1, 2, 3])], name, { type: "image/png" });
}

describe("tool-handoff", () => {
  beforeEach(() => {
    // Drain any handoff left over from a previous test.
    consumeToolHandoff("imagen-convertir");
  });

  it("returns null when nothing was ever set", () => {
    expect(consumeToolHandoff("imagen-convertir")).toBeNull();
  });

  it("hands the file to the matching target and clears it", () => {
    const file = makeFile();
    setToolHandoff({ sourceTool: "imagen-comprimir", targetTool: "imagen-convertir", file });

    expect(consumeToolHandoff("imagen-convertir")).toBe(file);
    expect(consumeToolHandoff("imagen-convertir")).toBeNull();
  });

  it("does not leak to a tool it wasn't meant for, and stays available for the right one", () => {
    const file = makeFile();
    setToolHandoff({ sourceTool: "imagen-comprimir", targetTool: "imagen-convertir", file });

    expect(consumeToolHandoff("dev-json-formatter")).toBeNull();
    expect(consumeToolHandoff("imagen-convertir")).toBe(file);
  });
});
