export type NumberBase = 2 | 8 | 10 | 16;

const DIGIT_PATTERNS: Record<NumberBase, RegExp> = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^[0-9]+$/,
  16: /^[0-9a-fA-F]+$/,
};

export interface NumberBaseResult {
  2: string;
  8: string;
  10: string;
  16: string;
}

/** Converts a value written in `fromBase` into its binary/octal/decimal/hex representations. Returns null for empty input, negative signs, or digits invalid in the given base. */
export function convertNumberBase(value: string, fromBase: NumberBase): NumberBaseResult | null {
  const trimmed = value.trim();
  if (trimmed === "" || !DIGIT_PATTERNS[fromBase].test(trimmed)) return null;

  const n = parseInt(trimmed, fromBase);
  if (!Number.isFinite(n) || !Number.isSafeInteger(n)) return null;

  return {
    2: n.toString(2),
    8: n.toString(8),
    10: n.toString(10),
    16: n.toString(16).toUpperCase(),
  };
}
