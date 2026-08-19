/**
 * Currency conversion backed by the Frankfurter API (https://frankfurter.dev),
 * which republishes European Central Bank reference rates — free, no API
 * key, no attribution required. This is the one tool in Herramio that isn't
 * fully offline: exchange rates change daily and there is no way to
 * "compute" them, so a real external source is unavoidable here (see
 * PRODUCT-ROADMAP.md for the reasoning).
 *
 * Coverage limitation, stated honestly: the ECB only publishes reference
 * rates for ~30 major currencies — notably it does NOT include COP, ARS,
 * CLP or PEN. `SUPPORTED_CURRENCIES` reflects exactly what the API
 * supports; we never show a currency we can't actually convert.
 */

export const SUPPORTED_CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "AUD", "BRL", "CAD", "CHF", "CNY", "CZK",
  "DKK", "HKD", "HUF", "IDR", "ILS", "INR", "ISK", "KRW", "MXN", "MYR",
  "NOK", "NZD", "PHP", "PLN", "RON", "SEK", "SGD", "THB", "TRY", "ZAR",
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export interface CurrencyRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export async function fetchCurrencyRates(base: CurrencyCode): Promise<CurrencyRates> {
  const res = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
  if (!res.ok) {
    throw new Error("No se pudo obtener el tipo de cambio. Intenta de nuevo en unos minutos.");
  }
  const data = await res.json();
  return { base: data.base, date: data.date, rates: data.rates };
}

export function convertCurrency(amount: number, rate: number): number | null {
  if (!Number.isFinite(amount) || !Number.isFinite(rate)) return null;
  if (amount < 0) return null;
  return amount * rate;
}
