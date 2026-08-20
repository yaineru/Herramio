export interface SplitBillResult {
  tipAmount: number;
  totalWithTip: number;
  perPerson: number;
}

/** Splits a bill (with an optional tip) evenly among a group. */
export function splitBill(subtotal: number, tipPercent: number, people: number): SplitBillResult | null {
  if (!Number.isFinite(subtotal) || subtotal < 0) return null;
  if (!Number.isFinite(tipPercent) || tipPercent < 0) return null;
  if (!Number.isFinite(people) || people < 1 || !Number.isInteger(people)) return null;

  const tipAmount = subtotal * (tipPercent / 100);
  const totalWithTip = subtotal + tipAmount;

  return {
    tipAmount,
    totalWithTip,
    perPerson: totalWithTip / people,
  };
}
