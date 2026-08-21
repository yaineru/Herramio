export type DateUnit = "days" | "weeks" | "months" | "years";

/** Adds (or subtracts, with a negative amount) a number of days/weeks/months/years to a date. */
export function addToDate(date: Date, amount: number, unit: DateUnit): Date {
  const result = new Date(date.getTime());
  switch (unit) {
    case "days":
      result.setDate(result.getDate() + amount);
      break;
    case "weeks":
      result.setDate(result.getDate() + amount * 7);
      break;
    case "months":
      result.setMonth(result.getMonth() + amount);
      break;
    case "years":
      result.setFullYear(result.getFullYear() + amount);
      break;
  }
  return result;
}
