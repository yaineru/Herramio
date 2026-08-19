import { describe, it, expect } from "vitest";
import { formatCountdown, formatStopwatch } from "@/lib/productivity/time-format";

describe("formatCountdown", () => {
  it("formats seconds under a minute", () => {
    expect(formatCountdown(5)).toBe("00:05");
  });
  it("formats minutes and seconds", () => {
    expect(formatCountdown(125)).toBe("02:05");
  });
  it("formats hours once it reaches 3600 seconds", () => {
    expect(formatCountdown(3661)).toBe("1:01:01");
  });
  it("clamps negative values to zero", () => {
    expect(formatCountdown(-10)).toBe("00:00");
  });
});

describe("formatStopwatch", () => {
  it("formats milliseconds with centiseconds", () => {
    expect(formatStopwatch(1234)).toBe("00:01.23");
  });
  it("formats minutes, seconds and centiseconds", () => {
    expect(formatStopwatch(65_432)).toBe("01:05.43");
  });
  it("formats hours once it reaches an hour", () => {
    expect(formatStopwatch(3_661_000)).toBe("1:01:01.00");
  });
});
