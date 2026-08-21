import { describe, it, expect } from "vitest";
import { numberToWords } from "@/lib/text/number-to-words";

describe("numberToWords", () => {
  it("spells out zero and small numbers", () => {
    expect(numberToWords(0)).toBe("cero");
    expect(numberToWords(1)).toBe("uno");
    expect(numberToWords(9)).toBe("nueve");
  });

  it("spells out teens and twenties with the veinti- contraction", () => {
    expect(numberToWords(15)).toBe("quince");
    expect(numberToWords(21)).toBe("veintiuno");
    expect(numberToWords(29)).toBe("veintinueve");
  });

  it("spells out tens with 'y'", () => {
    expect(numberToWords(30)).toBe("treinta");
    expect(numberToWords(45)).toBe("cuarenta y cinco");
    expect(numberToWords(99)).toBe("noventa y nueve");
  });

  it("spells out hundreds, including the irregular 'cien'", () => {
    expect(numberToWords(100)).toBe("cien");
    expect(numberToWords(101)).toBe("ciento uno");
    expect(numberToWords(200)).toBe("doscientos");
    expect(numberToWords(999)).toBe("novecientos noventa y nueve");
  });

  it("spells out thousands, including the bare 'mil'", () => {
    expect(numberToWords(1000)).toBe("mil");
    expect(numberToWords(1001)).toBe("mil uno");
    expect(numberToWords(2000)).toBe("dos mil");
    expect(numberToWords(45000)).toBe("cuarenta y cinco mil");
  });

  it("applies the apocope of uno before mil and millones", () => {
    expect(numberToWords(21000)).toBe("veintiún mil");
    expect(numberToWords(31000)).toBe("treinta y un mil");
    expect(numberToWords(101000)).toBe("ciento un mil");
    expect(numberToWords(21_000_000)).toBe("veintiún millones");
  });

  it("spells out millions, singular vs plural", () => {
    expect(numberToWords(1_000_000)).toBe("un millón");
    expect(numberToWords(2_000_000)).toBe("dos millones");
  });

  it("combines millions, thousands and remainder", () => {
    expect(numberToWords(1_234_567)).toBe("un millón doscientos treinta y cuatro mil quinientos sesenta y siete");
  });

  it("rejects negative numbers, non-integers and out-of-range values", () => {
    expect(numberToWords(-5)).toBeNull();
    expect(numberToWords(5.5)).toBeNull();
    expect(numberToWords(1_000_000_000)).toBeNull();
  });
});
