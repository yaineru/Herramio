import { describe, it, expect } from "vitest";
import { parseCronExpression, describeCron, nextRunTimes } from "@/lib/dev/cron";

describe("parseCronExpression", () => {
  it("parses a simple daily schedule", () => {
    const result = parseCronExpression("30 9 * * *");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.minute).toEqual([30]);
    expect(result.value.hour).toEqual([9]);
    expect(result.value.dayOfMonth.length).toBe(31);
  });

  it("parses step expressions", () => {
    const result = parseCronExpression("*/15 * * * *");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.minute).toEqual([0, 15, 30, 45]);
  });

  it("parses ranges and lists", () => {
    const result = parseCronExpression("0 9-11 * * 1,3,5");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.hour).toEqual([9, 10, 11]);
    expect(result.value.dayOfWeek).toEqual([1, 3, 5]);
  });

  it("rejects an expression without exactly 5 fields", () => {
    expect(parseCronExpression("* * * *").ok).toBe(false);
    expect(parseCronExpression("* * * * * *").ok).toBe(false);
  });

  it("rejects an out-of-range value", () => {
    expect(parseCronExpression("60 * * * *").ok).toBe(false);
    expect(parseCronExpression("* 24 * * *").ok).toBe(false);
  });

  it("rejects garbage input", () => {
    expect(parseCronExpression("a b c d e").ok).toBe(false);
  });
});

describe("describeCron", () => {
  it("describes every minute", () => {
    const result = parseCronExpression("* * * * *");
    if (!result.ok) throw new Error("expected ok");
    expect(describeCron(result.value)).toBe("Se ejecuta cada minuto, todos los días.");
  });

  it("describes a step schedule", () => {
    const result = parseCronExpression("*/15 * * * *");
    if (!result.ok) throw new Error("expected ok");
    expect(describeCron(result.value)).toBe("Se ejecuta cada 15 minutos, todos los días.");
  });

  it("describes a specific daily time", () => {
    const result = parseCronExpression("30 9 * * *");
    if (!result.ok) throw new Error("expected ok");
    expect(describeCron(result.value)).toBe("Se ejecuta a las 09:30, todos los días.");
  });

  it("describes specific weekdays", () => {
    const result = parseCronExpression("0 8 * * 1,2,3,4,5");
    if (!result.ok) throw new Error("expected ok");
    expect(describeCron(result.value)).toBe(
      "Se ejecuta a las 08:00, los lunes, martes, miércoles, jueves, viernes.",
    );
  });
});

describe("nextRunTimes", () => {
  it("finds the next N daily occurrences at a fixed time", () => {
    const result = parseCronExpression("0 9 * * *");
    if (!result.ok) throw new Error("expected ok");
    const from = new Date(2026, 0, 1, 10, 0, 0); // Jan 1 2026, 10:00 — after today's 9:00 already passed
    const runs = nextRunTimes(result.value, from, 3);
    expect(runs).toHaveLength(3);
    expect(runs[0].getDate()).toBe(2);
    expect(runs[0].getHours()).toBe(9);
    expect(runs[0].getMinutes()).toBe(0);
    expect(runs[1].getDate()).toBe(3);
    expect(runs[2].getDate()).toBe(4);
  });

  it("respects a specific weekday restriction", () => {
    const result = parseCronExpression("0 12 * * 1"); // every Monday at noon
    if (!result.ok) throw new Error("expected ok");
    const from = new Date(2026, 0, 1, 0, 0, 0); // Jan 1 2026 is a Thursday
    const runs = nextRunTimes(result.value, from, 1);
    expect(runs[0].getDay()).toBe(1);
  });
});
