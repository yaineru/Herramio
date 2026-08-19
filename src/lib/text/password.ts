export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
} as const;

// Characters that are easy to confuse visually (l/1/I, O/0, etc.)
const AMBIGUOUS_CHARS = new Set("il1IloO0|");

export function buildCharset(options: PasswordOptions): string {
  let charset = "";
  if (options.uppercase) charset += CHAR_SETS.uppercase;
  if (options.lowercase) charset += CHAR_SETS.lowercase;
  if (options.numbers) charset += CHAR_SETS.numbers;
  if (options.symbols) charset += CHAR_SETS.symbols;
  if (options.excludeAmbiguous) {
    charset = Array.from(charset)
      .filter((c) => !AMBIGUOUS_CHARS.has(c))
      .join("");
  }
  return charset;
}

/**
 * Generates a password using crypto.getRandomValues (CSPRNG) — never
 * Math.random, which is not safe for anything security-sensitive.
 * Returns null when no character set is selected or the charset ends up
 * empty (e.g. excluding ambiguous chars removes everything selected).
 */
export function generatePassword(options: PasswordOptions): string | null {
  const charset = buildCharset(options);
  if (charset.length === 0 || options.length <= 0) return null;

  const randomValues = new Uint32Array(options.length);
  crypto.getRandomValues(randomValues);

  let password = "";
  for (let i = 0; i < options.length; i++) {
    password += charset[randomValues[i] % charset.length];
  }
  return password;
}

export type PasswordStrength = "muy-debil" | "debil" | "media" | "fuerte" | "muy-fuerte";

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  label: string;
  score: number; // 0-4
}

/**
 * Rough entropy-based estimate: counts character-class variety and length.
 * Not a substitute for a real breach-database check, but good enough to
 * guide users away from short/simple passwords.
 */
export function estimatePasswordStrength(password: string): PasswordStrengthResult {
  if (password.length === 0) return { strength: "muy-debil", label: "Muy débil", score: 0 };

  let variety = 0;
  if (/[a-z]/.test(password)) variety++;
  if (/[A-Z]/.test(password)) variety++;
  if (/[0-9]/.test(password)) variety++;
  if (/[^a-zA-Z0-9]/.test(password)) variety++;

  const poolSize = variety * 25; // rough approximation
  const entropyBits = password.length * Math.log2(Math.max(poolSize, 2));

  let score: number;
  if (entropyBits < 28 || password.length < 8) score = 0;
  else if (entropyBits < 45) score = 1;
  else if (entropyBits < 65) score = 2;
  else if (entropyBits < 90) score = 3;
  else score = 4;

  const labels: Record<number, { strength: PasswordStrength; label: string }> = {
    0: { strength: "muy-debil", label: "Muy débil" },
    1: { strength: "debil", label: "Débil" },
    2: { strength: "media", label: "Media" },
    3: { strength: "fuerte", label: "Fuerte" },
    4: { strength: "muy-fuerte", label: "Muy fuerte" },
  };

  return { ...labels[score], score };
}
