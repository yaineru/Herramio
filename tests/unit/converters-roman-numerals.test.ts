import { describe, it, expect } from "vitest";
import { arabicToRoman, romanToArabic } from "@/lib/converters/roman-numerals";

describe("arabicToRoman", () => {
  it("converts standard examples correctly", () => {
    expect(arabicToRoman(1994)).toBe("MCMXCIV");
    expect(arabicToRoman(4)).toBe("IV");
    expect(arabicToRoman(9)).toBe("IX");
    expect(arabicToRoman(58)).toBe("LVIII");
    expect(arabicToRoman(3999)).toBe("MMMCMXCIX");
    expect(arabicToRoman(1)).toBe("I");
  });

  it("rejects out-of-range or non-integer input", () => {
    expect(arabicToRoman(0)).toBeNull();
    expect(arabicToRoman(4000)).toBeNull();
    expect(arabicToRoman(-5)).toBeNull();
    expect(arabicToRoman(3.5)).toBeNull();
  });
});

describe("romanToArabic", () => {
  it("converts standard examples correctly", () => {
    expect(romanToArabic("MCMXCIV")).toBe(1994);
    expect(romanToArabic("iv")).toBe(4);
    expect(romanToArabic("IX")).toBe(9);
    expect(romanToArabic("MMMCMXCIX")).toBe(3999);
  });

  it("rejects malformed numerals via the round-trip check", () => {
    expect(romanToArabic("IIII")).toBeNull();
    expect(romanToArabic("VX")).toBeNull();
    expect(romanToArabic("IC")).toBeNull();
  });

  it("rejects invalid characters", () => {
    expect(romanToArabic("ABC")).toBeNull();
    expect(romanToArabic("")).toBeNull();
  });

  it("round-trips every value from 1 to 3999", () => {
    for (let n = 1; n <= 3999; n += 37) {
      const roman = arabicToRoman(n);
      expect(roman).not.toBeNull();
      expect(romanToArabic(roman as string)).toBe(n);
    }
  });
});
