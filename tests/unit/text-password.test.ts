import { describe, it, expect } from "vitest";
import { buildCharset, generatePassword, estimatePasswordStrength } from "@/lib/text/password";

const allOn = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
};

describe("buildCharset", () => {
  it("combines selected character sets", () => {
    const charset = buildCharset({ ...allOn, uppercase: true, lowercase: false, numbers: false, symbols: false });
    expect(charset).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  });
  it("returns empty string when nothing is selected", () => {
    const charset = buildCharset({ ...allOn, uppercase: false, lowercase: false, numbers: false, symbols: false });
    expect(charset).toBe("");
  });
  it("removes ambiguous characters when requested", () => {
    const charset = buildCharset({ ...allOn, lowercase: false, uppercase: false, symbols: false, numbers: true, excludeAmbiguous: true });
    expect(charset).not.toContain("0");
    expect(charset).not.toContain("1");
  });
});

describe("generatePassword", () => {
  it("generates a password of the requested length", () => {
    const password = generatePassword(allOn);
    expect(password).not.toBeNull();
    expect(password!.length).toBe(16);
  });
  it("returns null when no character set is selected", () => {
    const password = generatePassword({ ...allOn, uppercase: false, lowercase: false, numbers: false, symbols: false });
    expect(password).toBeNull();
  });
  it("returns null for zero length", () => {
    expect(generatePassword({ ...allOn, length: 0 })).toBeNull();
  });
  it("only uses characters from the selected sets", () => {
    const password = generatePassword({ length: 50, uppercase: true, lowercase: false, numbers: false, symbols: false, excludeAmbiguous: false });
    expect(password).toMatch(/^[A-Z]+$/);
  });
  it("generates different passwords on subsequent calls (extremely unlikely to collide)", () => {
    const a = generatePassword(allOn);
    const b = generatePassword(allOn);
    expect(a).not.toBe(b);
  });
});

describe("estimatePasswordStrength", () => {
  it("rates an empty password as muy-debil", () => {
    expect(estimatePasswordStrength("").strength).toBe("muy-debil");
  });
  it("rates a short simple password as weak", () => {
    expect(estimatePasswordStrength("abc123").score).toBeLessThanOrEqual(1);
  });
  it("rates a long varied password as strong", () => {
    expect(estimatePasswordStrength("K9#mZ2$pL8vQ4xR!").score).toBeGreaterThanOrEqual(3);
  });
});
