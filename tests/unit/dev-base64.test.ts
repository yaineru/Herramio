import { describe, it, expect } from "vitest";
import { encodeBase64, decodeBase64 } from "@/lib/dev/base64";

describe("encodeBase64 / decodeBase64", () => {
  it("round-trips ASCII text", () => {
    const encoded = encodeBase64("hello world");
    expect(encoded).toBe("aGVsbG8gd29ybGQ=");
    const decoded = decodeBase64(encoded);
    expect(decoded).toEqual({ ok: true, value: "hello world" });
  });

  it("round-trips UTF-8 text with accents and emoji", () => {
    const original = "Ñandú café 🚀";
    const encoded = encodeBase64(original);
    const decoded = decodeBase64(encoded);
    expect(decoded).toEqual({ ok: true, value: original });
  });

  it("returns an error for invalid base64 input", () => {
    const result = decodeBase64("not-valid-base64!!!");
    expect(result.ok).toBe(false);
  });
});
