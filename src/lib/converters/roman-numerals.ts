const TABLE: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

const ROMAN_VALUES: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

/** Converts an integer (1–3999, the range classical Roman numerals can express) to its Roman numeral form. */
export function arabicToRoman(num: number): string | null {
  if (!Number.isInteger(num) || num < 1 || num > 3999) return null;
  let remaining = num;
  let result = "";
  for (const [value, symbol] of TABLE) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}

/** Parses a Roman numeral back to an integer, rejecting malformed forms (e.g. "IIII", "VX") by checking the round trip against arabicToRoman. */
export function romanToArabic(roman: string): number | null {
  const s = roman.trim().toUpperCase();
  if (!/^[IVXLCDM]+$/.test(s)) return null;

  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const current = ROMAN_VALUES[s[i]];
    const next = i + 1 < s.length ? ROMAN_VALUES[s[i + 1]] : 0;
    total += current < next ? -current : current;
  }

  if (total < 1 || total > 3999 || arabicToRoman(total) !== s) return null;
  return total;
}
