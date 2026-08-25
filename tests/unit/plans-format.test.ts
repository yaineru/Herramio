import { describe, it, expect } from "vitest";
import { formatCurrencyFromCents } from "@/lib/plans/format";

describe("formatCurrencyFromCents", () => {
  it("formats whole-dollar amounts without decimals", () => {
    expect(formatCurrencyFromCents(100, "USD")).toMatch(/^US\$\s1$/);
    expect(formatCurrencyFromCents(500, "USD")).toMatch(/^US\$\s5$/);
  });

  it("formats free (zero) as a currency amount, not a special case", () => {
    expect(formatCurrencyFromCents(0, "USD")).toMatch(/^US\$\s0$/);
  });

  it("keeps decimals when the amount isn't a whole currency unit", () => {
    expect(formatCurrencyFromCents(150, "USD")).toMatch(/^US\$\s1,50$/);
  });
});
