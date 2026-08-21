export interface Participant {
  name: string;
  paid: number;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

const EPSILON = 0.005;

/**
 * Given what each participant actually paid toward a shared total, returns
 * the minimal set of payments that settles all debts evenly (the classic
 * "who owes whom" simplification: match the biggest creditor against the
 * biggest debtor, repeat).
 */
export function calculateSettlements(participants: Participant[]): Settlement[] | null {
  if (participants.length < 2) return null;

  const names = participants.map((p) => p.name.trim());
  if (names.some((n) => n === "")) return null;
  if (new Set(names).size !== names.length) return null;
  if (participants.some((p) => !Number.isFinite(p.paid) || p.paid < 0)) return null;

  const total = participants.reduce((sum, p) => sum + p.paid, 0);
  const share = total / participants.length;

  const balances = participants.map((p, i) => ({ name: names[i], balance: p.paid - share }));
  const creditors = balances.filter((b) => b.balance > EPSILON).sort((a, b) => b.balance - a.balance);
  const debtors = balances.filter((b) => b.balance < -EPSILON).sort((a, b) => a.balance - b.balance);

  const settlements: Settlement[] = [];
  let ci = 0;
  let di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const credit = creditors[ci];
    const debt = debtors[di];
    const amount = Math.min(credit.balance, -debt.balance);

    if (amount > EPSILON) {
      settlements.push({ from: debt.name, to: credit.name, amount: round2(amount) });
    }

    credit.balance -= amount;
    debt.balance += amount;
    if (credit.balance <= EPSILON) ci++;
    if (debt.balance >= -EPSILON) di++;
  }

  return settlements;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
