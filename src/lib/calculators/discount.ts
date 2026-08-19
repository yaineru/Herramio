export interface DiscountResult {
  savings: number;
  finalPrice: number;
}

/** Returns null for negative or non-finite inputs. */
export function calculateDiscount(originalPrice: number, discountPercent: number): DiscountResult | null {
  if (!Number.isFinite(originalPrice) || !Number.isFinite(discountPercent)) return null;
  if (originalPrice < 0 || discountPercent < 0) return null;

  const savings = originalPrice * (discountPercent / 100);
  return { savings, finalPrice: originalPrice - savings };
}
