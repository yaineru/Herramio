import { describe, it, expect } from "vitest";
import { timestampToDate, dateToTimestamp } from "@/lib/dev/timestamp";

describe("timestampToDate", () => {
  it("converts a seconds timestamp to a known ISO date", () => {
    const result = timestampToDate("0", "seconds");
    expect(result.ok).toBe(true);
    expect(result.iso).toBe("1970-01-01T00:00:00.000Z");
  });

  it("converts a milliseconds timestamp", () => {
    const result = timestampToDate("1000", "milliseconds");
    expect(result.ok).toBe(true);
    expect(result.iso).toBe("1970-01-01T00:00:01.000Z");
  });

  it("rejects non-numeric input", () => {
    const result = timestampToDate("not-a-number", "seconds");
    expect(result.ok).toBe(false);
  });

  it("accepts negative timestamps (pre-1970)", () => {
    const result = timestampToDate("-1", "seconds");
    expect(result.ok).toBe(true);
    expect(result.iso).toBe("1969-12-31T23:59:59.000Z");
  });
});

describe("dateToTimestamp", () => {
  it("converts an ISO date string to seconds and milliseconds", () => {
    const result = dateToTimestamp("1970-01-01T00:00:00.000Z");
    expect(result.ok).toBe(true);
    expect(result.seconds).toBe(0);
    expect(result.milliseconds).toBe(0);
  });

  it("rejects an unparseable date", () => {
    const result = dateToTimestamp("not-a-date");
    expect(result.ok).toBe(false);
  });

  it("rejects an empty string", () => {
    const result = dateToTimestamp("");
    expect(result.ok).toBe(false);
  });
});
