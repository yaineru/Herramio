export interface TipResult {
  tipAmount: number;
  totalAmount: number;
  perPersonTip: number;
  perPersonTotal: number;
}

/** Tip calculator: how much to tip and, when splitting, how much each person owes. */
export function calculateTip(bill: number, tipPercent: number, people: number = 1): TipResult | null {
  if (!Number.isFinite(bill) || bill < 0) return null;
  if (!Number.isFinite(tipPercent) || tipPercent < 0) return null;
  if (!Number.isFinite(people) || people < 1) return null;

  const tipAmount = bill * (tipPercent / 100);
  const totalAmount = bill + tipAmount;

  return {
    tipAmount,
    totalAmount,
    perPersonTip: tipAmount / people,
    perPersonTotal: totalAmount / people,
  };
}
