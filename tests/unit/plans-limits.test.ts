import { describe, it, expect } from "vitest";
import { checkUsageLimit } from "@/lib/plans/limits";
import type { Entitlements } from "@/lib/plans/types";

function makeEntitlements(metadata: Record<string, unknown>): Entitlements {
  return {
    planId: "free",
    planName: "Gratis",
    adsEnabled: true,
    higherLimits: false,
    premiumTools: false,
    teamsEnabled: false,
    maxTeamMembers: null,
    metadata,
  };
}

describe("checkUsageLimit", () => {
  it("allows and reports remaining slots under a configured numeric limit", () => {
    const result = checkUsageLimit(makeEntitlements({ favorites_limit: 10 }), "favorites_limit", 3);
    expect(result).toEqual({ allowed: true, limit: 10, remaining: 7 });
  });

  it("denies exactly at the limit — not one over", () => {
    const result = checkUsageLimit(makeEntitlements({ favorites_limit: 10 }), "favorites_limit", 10);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("never reports negative remaining", () => {
    const result = checkUsageLimit(makeEntitlements({ favorites_limit: 10 }), "favorites_limit", 15);
    expect(result.remaining).toBe(0);
  });

  it("treats a missing key as unlimited — never a fabricated zero limit", () => {
    const result = checkUsageLimit(makeEntitlements({}), "favorites_limit", 999);
    expect(result).toEqual({ allowed: true, limit: null, remaining: null });
  });

  it("treats an explicit null as unlimited (e.g. Pro/Team plans)", () => {
    const result = checkUsageLimit(makeEntitlements({ favorites_limit: null }), "favorites_limit", 999);
    expect(result.allowed).toBe(true);
    expect(result.limit).toBeNull();
  });

  it("treats a non-numeric value as unlimited rather than throwing or misreading it", () => {
    const result = checkUsageLimit(makeEntitlements({ favorites_limit: "unlimited" }), "favorites_limit", 999);
    expect(result.allowed).toBe(true);
    expect(result.limit).toBeNull();
  });
});
