export interface VatResult {
  base: number;
  vatAmount: number;
  total: number;
}

/** Given a price without tax, adds VAT/IVA. */
export function addVat(basePrice: number, vatPercent: number): VatResult | null {
  if (!Number.isFinite(basePrice) || !Number.isFinite(vatPercent)) return null;
  if (basePrice < 0 || vatPercent < 0) return null;

  const vatAmount = basePrice * (vatPercent / 100);
  return { base: basePrice, vatAmount, total: basePrice + vatAmount };
}

/** Given a price that already includes VAT/IVA, extracts the tax-free base. */
export function removeVat(totalWithVat: number, vatPercent: number): VatResult | null {
  if (!Number.isFinite(totalWithVat) || !Number.isFinite(vatPercent)) return null;
  if (totalWithVat < 0 || vatPercent < 0) return null;

  const base = totalWithVat / (1 + vatPercent / 100);
  return { base, vatAmount: totalWithVat - base, total: totalWithVat };
}
