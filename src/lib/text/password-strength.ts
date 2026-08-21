export interface PasswordChecks {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  symbol: boolean;
}

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  checks: PasswordChecks;
  entropyBits: number;
}

const LABELS = ["Muy débil", "Débil", "Regular", "Fuerte", "Muy fuerte"] as const;

/** Estimates a password's strength from its composition and length — a heuristic, not a cryptographic guarantee. */
export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const checks: PasswordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  let poolSize = 0;
  if (checks.lowercase) poolSize += 26;
  if (checks.uppercase) poolSize += 26;
  if (checks.number) poolSize += 10;
  if (checks.symbol) poolSize += 32;
  const entropyBits = password.length > 0 && poolSize > 0 ? Math.round(password.length * Math.log2(poolSize)) : 0;

  const passedChecks = [checks.uppercase, checks.lowercase, checks.number, checks.symbol].filter(Boolean).length;
  let score: 0 | 1 | 2 | 3 | 4;
  if (password.length === 0) score = 0;
  else if (password.length < 8 || passedChecks <= 1) score = 0;
  else if (passedChecks === 2) score = 1;
  else if (passedChecks === 3) score = password.length >= 12 ? 3 : 2;
  else score = password.length >= 12 ? 4 : 3;

  return { score, label: LABELS[score], checks, entropyBits };
}
