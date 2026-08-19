export interface AgeResult {
  years: number;
  months: number;
  days: number;
  daysUntilNextBirthday: number;
  totalDays: number;
}

export type AgeCalcResult = { ok: true; value: AgeResult } | { ok: false; error: string };

/** Calendar-aware age (not just a day-count division) — years/months/days like a person would say it out loud. */
export function calculateAge(birthDate: Date, today: Date = new Date()): AgeCalcResult {
  if (Number.isNaN(birthDate.getTime())) return { ok: false, error: "Fecha de nacimiento inválida." };
  if (birthDate.getTime() > today.getTime()) return { ok: false, error: "La fecha de nacimiento no puede ser futura." };

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    const daysInPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += daysInPrevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  if (nextBirthday.getTime() < today.getTime()) {
    nextBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
  }
  const daysUntilNextBirthday = Math.round((nextBirthday.getTime() - today.getTime()) / 86_400_000);
  const totalDays = Math.floor((today.getTime() - birthDate.getTime()) / 86_400_000);

  return { ok: true, value: { years, months, days, daysUntilNextBirthday, totalDays } };
}
