const UNITS = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
const TEENS = ["diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"];
const TWENTIES = ["veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"];
const TENS = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
const HUNDREDS = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

function twoDigits(n: number): string {
  if (n < 10) return UNITS[n];
  if (n < 20) return TEENS[n - 10];
  if (n < 30) return TWENTIES[n - 20];
  const tens = Math.floor(n / 10);
  const units = n % 10;
  return units === 0 ? TENS[tens] : `${TENS[tens]} y ${UNITS[units]}`;
}

function threeDigits(n: number): string {
  if (n === 100) return "cien";
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const hundredsWord = hundreds > 0 ? HUNDREDS[hundreds] : "";
  const restWord = rest > 0 ? twoDigits(rest) : "";
  return [hundredsWord, restWord].filter(Boolean).join(" ");
}

/** Applies the Spanish apocope of "uno" -> "un" (and "veintiuno" -> "veintiún") that happens right before a noun like "mil" or "millones". */
function apocopeUno(words: string): string {
  if (words.endsWith("veintiuno")) return `${words.slice(0, -"veintiuno".length)}veintiún`;
  if (words === "uno" || words.endsWith(" uno")) return `${words.slice(0, -"uno".length)}un`;
  return words;
}

/** Spells out a non-negative integer (0 to 999,999,999) in Spanish words. */
export function numberToWords(n: number): string | null {
  if (!Number.isInteger(n) || n < 0 || n > 999_999_999) return null;
  if (n === 0) return "cero";

  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const remainder = n % 1000;

  const parts: string[] = [];

  if (millions > 0) {
    parts.push(millions === 1 ? "un millón" : `${apocopeUno(threeDigits(millions))} millones`);
  }

  if (thousands > 0) {
    parts.push(thousands === 1 ? "mil" : `${apocopeUno(threeDigits(thousands))} mil`);
  }

  if (remainder > 0) {
    parts.push(threeDigits(remainder));
  }

  return parts.join(" ");
}
