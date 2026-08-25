/**
 * Formats a plan price for display from its stored integer cents + ISO
 * currency code — never hardcode a "$" or a price string anywhere else.
 */
export function formatCurrencyFromCents(cents: number, currency: string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
