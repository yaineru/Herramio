import { describe, it, expect } from "vitest";
import { convertDataSize } from "@/lib/converters/data-size";

describe("convertDataSize", () => {
  it("converts using the binary base (1024)", () => {
    const result = convertDataSize(1, "gb", 1024);
    expect(result?.mb).toBeCloseTo(1024);
    expect(result?.kb).toBeCloseTo(1024 * 1024);
    expect(result?.b).toBeCloseTo(1024 ** 3);
    expect(result?.tb).toBeCloseTo(1 / 1024);
  });

  it("converts using the decimal base (1000)", () => {
    const result = convertDataSize(1, "gb", 1000);
    expect(result?.mb).toBeCloseTo(1000);
    expect(result?.b).toBeCloseTo(1000 ** 3);
  });

  it("round-trips the input unit back to itself", () => {
    const result = convertDataSize(42, "mb", 1024);
    expect(result?.mb).toBeCloseTo(42);
  });

  it("rejects negative or non-finite values", () => {
    expect(convertDataSize(-1, "mb", 1024)).toBeNull();
    expect(convertDataSize(NaN, "mb", 1024)).toBeNull();
    expect(convertDataSize(Infinity, "mb", 1024)).toBeNull();
  });

  it("handles zero", () => {
    const result = convertDataSize(0, "gb", 1024);
    expect(result?.tb).toBe(0);
    expect(result?.b).toBe(0);
  });
});
