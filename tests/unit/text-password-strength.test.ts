import { describe, it, expect } from "vitest";
import { checkPasswordStrength } from "@/lib/text/password-strength";

describe("checkPasswordStrength", () => {
  it("scores an empty password as very weak", () => {
    expect(checkPasswordStrength("").score).toBe(0);
  });

  it("scores a short single-category password as very weak", () => {
    const result = checkPasswordStrength("abcdefgh");
    expect(result.score).toBe(0);
    expect(result.checks).toEqual({ length: true, uppercase: false, lowercase: true, number: false, symbol: false });
  });

  it("scores a two-category password under 12 chars as weak", () => {
    expect(checkPasswordStrength("abcdefgh1").score).toBe(1);
  });

  it("scores a three-category password under 12 chars as regular", () => {
    expect(checkPasswordStrength("Abcdefgh1").score).toBe(2);
  });

  it("scores a three-category password of 12+ chars as strong", () => {
    expect(checkPasswordStrength("Abcdefghijk1").score).toBe(3);
  });

  it("scores a four-category password of 12+ chars as very strong", () => {
    const result = checkPasswordStrength("Abcdefghijk1!");
    expect(result.score).toBe(4);
    expect(result.checks).toEqual({ length: true, uppercase: true, lowercase: true, number: true, symbol: true });
  });

  it("computes higher entropy for longer, more varied passwords", () => {
    const weak = checkPasswordStrength("aaaaaaaa");
    const strong = checkPasswordStrength("Abcdefghijk1!");
    expect(strong.entropyBits).toBeGreaterThan(weak.entropyBits);
  });
});
