import { describe, it, expect } from "vitest";
import { encodeUrlComponent, decodeUrlComponent } from "@/lib/dev/url-encoding";

describe("encodeUrlComponent / decodeUrlComponent", () => {
  it("round-trips text with special characters", () => {
    const original = "hola mundo? a=1&b=2 ñ";
    const encoded = encodeUrlComponent(original);
    expect(encoded).not.toContain(" ");
    const decoded = decodeUrlComponent(encoded);
    expect(decoded).toEqual({ ok: true, value: original });
  });

  it("returns an error for malformed percent-encoding", () => {
    const result = decodeUrlComponent("%E0%A4%A");
    expect(result.ok).toBe(false);
  });
});
