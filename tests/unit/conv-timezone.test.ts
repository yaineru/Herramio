import { describe, it, expect } from "vitest";
import { convertTimeZone } from "@/lib/converters/timezone";

describe("convertTimeZone", () => {
  it("converts Bogotá (UTC-5, no DST) to Madrid (UTC+1 in January)", () => {
    // 2026-01-15 14:00 in Bogota -> 19:00 UTC -> 20:00 in Madrid (CET, same day).
    const result = convertTimeZone(2026, 1, 15, 14, 0, "America/Bogota", "Europe/Madrid");
    expect(result).not.toBeNull();
    expect(result?.targetDate).toBe("2026-01-15");
    expect(result?.targetTime).toBe("20:00");
    expect(result?.dayOffset).toBe(0);
  });

  it("rolls over to the next day when the target zone is far ahead", () => {
    // 2026-01-15 23:00 in Los Angeles (PST, UTC-8) -> 07:00 UTC next day -> 16:00 in Tokyo (UTC+9).
    const result = convertTimeZone(2026, 1, 15, 23, 0, "America/Los_Angeles", "Asia/Tokyo");
    expect(result).not.toBeNull();
    expect(result?.targetDate).toBe("2026-01-16");
    expect(result?.targetTime).toBe("16:00");
    expect(result?.dayOffset).toBe(1);
  });

  it("is the identity when source and target zone are the same", () => {
    const result = convertTimeZone(2026, 6, 1, 9, 30, "Europe/Paris", "Europe/Paris");
    expect(result?.targetTime).toBe("09:30");
    expect(result?.dayOffset).toBe(0);
  });

  it("rejects non-finite input", () => {
    expect(convertTimeZone(NaN, 1, 15, 14, 0, "UTC", "UTC")).toBeNull();
  });
});
