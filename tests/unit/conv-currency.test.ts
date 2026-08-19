import { describe, it, expect, vi, afterEach } from "vitest";
import { convertCurrency, fetchCurrencyRates, SUPPORTED_CURRENCIES } from "@/lib/converters/currency";

describe("convertCurrency", () => {
  it("multiplies amount by rate", () => {
    expect(convertCurrency(100, 0.86)).toBeCloseTo(86, 5);
  });
  it("returns null for negative amount", () => {
    expect(convertCurrency(-10, 0.86)).toBeNull();
  });
  it("returns null for non-finite input", () => {
    expect(convertCurrency(NaN, 0.86)).toBeNull();
  });
  it("handles zero amount", () => {
    expect(convertCurrency(0, 0.86)).toBe(0);
  });
});

describe("SUPPORTED_CURRENCIES", () => {
  it("does not claim to support currencies the API doesn't have (e.g. COP/ARS)", () => {
    expect(SUPPORTED_CURRENCIES).not.toContain("COP");
    expect(SUPPORTED_CURRENCIES).not.toContain("ARS");
  });
  it("includes major currencies", () => {
    expect(SUPPORTED_CURRENCIES).toContain("USD");
    expect(SUPPORTED_CURRENCIES).toContain("EUR");
    expect(SUPPORTED_CURRENCIES).toContain("MXN");
  });
});

describe("fetchCurrencyRates", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses a successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ base: "USD", date: "2026-08-18", rates: { EUR: 0.86 } }),
      }),
    );
    const result = await fetchCurrencyRates("USD");
    expect(result).toEqual({ base: "USD", date: "2026-08-18", rates: { EUR: 0.86 } });
  });

  it("throws a friendly error when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(fetchCurrencyRates("USD")).rejects.toThrow(/no se pudo obtener/i);
  });
});
