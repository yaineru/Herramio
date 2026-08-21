import { describe, it, expect } from "vitest";
import { convertNumberBase } from "@/lib/converters/number-base";

describe("convertNumberBase", () => {
  it("converts a decimal number to binary/octal/hex", () => {
    const result = convertNumberBase("255", 10);
    expect(result).toEqual({ 2: "11111111", 8: "377", 10: "255", 16: "FF" });
  });

  it("converts a hex number to the other bases", () => {
    const result = convertNumberBase("ff", 16);
    expect(result).toEqual({ 2: "11111111", 8: "377", 10: "255", 16: "FF" });
  });

  it("converts a binary number to the other bases", () => {
    const result = convertNumberBase("1010", 2);
    expect(result).toEqual({ 2: "1010", 8: "12", 10: "10", 16: "A" });
  });

  it("rejects digits invalid for the given base", () => {
    expect(convertNumberBase("102", 2)).toBeNull(); // 2 is not a binary digit
    expect(convertNumberBase("18", 8)).toBeNull(); // 8 is not an octal digit
    expect(convertNumberBase("1g", 16)).toBeNull(); // g is not a hex digit
  });

  it("rejects empty input", () => {
    expect(convertNumberBase("", 10)).toBeNull();
    expect(convertNumberBase("   ", 10)).toBeNull();
  });

  it("handles zero", () => {
    expect(convertNumberBase("0", 10)).toEqual({ 2: "0", 8: "0", 10: "0", 16: "0" });
  });
});
