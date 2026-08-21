import { describe, it, expect } from "vitest";
import { calculateSettlements } from "@/lib/finanzas/group-expenses";

describe("calculateSettlements", () => {
  it("computes settlements for three participants with uneven contributions", () => {
    const result = calculateSettlements([
      { name: "Ana", paid: 90 },
      { name: "Bruno", paid: 0 },
      { name: "Carla", paid: 30 },
    ]);
    // Total 120, share 40. Ana +50, Bruno -40, Carla -10.
    expect(result).toEqual([
      { from: "Bruno", to: "Ana", amount: 40 },
      { from: "Carla", to: "Ana", amount: 10 },
    ]);
  });

  it("produces one settlement for two participants", () => {
    const result = calculateSettlements([
      { name: "Ana", paid: 100 },
      { name: "Bruno", paid: 0 },
    ]);
    expect(result).toEqual([{ from: "Bruno", to: "Ana", amount: 50 }]);
  });

  it("returns no settlements when everyone paid equally", () => {
    const result = calculateSettlements([
      { name: "Ana", paid: 50 },
      { name: "Bruno", paid: 50 },
    ]);
    expect(result).toEqual([]);
  });

  it("rejects fewer than two participants", () => {
    expect(calculateSettlements([{ name: "Ana", paid: 100 }])).toBeNull();
  });

  it("rejects duplicate names", () => {
    expect(
      calculateSettlements([
        { name: "Ana", paid: 50 },
        { name: "Ana", paid: 50 },
      ]),
    ).toBeNull();
  });

  it("rejects a negative contribution", () => {
    expect(
      calculateSettlements([
        { name: "Ana", paid: -10 },
        { name: "Bruno", paid: 50 },
      ]),
    ).toBeNull();
  });

  it("rejects an empty name", () => {
    expect(
      calculateSettlements([
        { name: "  ", paid: 10 },
        { name: "Bruno", paid: 50 },
      ]),
    ).toBeNull();
  });
});
