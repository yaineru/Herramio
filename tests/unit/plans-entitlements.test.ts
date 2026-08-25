import { describe, it, expect } from "vitest";
import { entitlementsFromPlan, FALLBACK_FREE_ENTITLEMENTS, FREE_PLAN_ID, type Plan } from "@/lib/plans/types";

function makePlan(overrides: Partial<Plan> = {}): Plan {
  return {
    id: "pro",
    name: "Pro",
    description: "",
    monthlyPriceCents: 399,
    annualPriceCents: 2999,
    currency: "USD",
    adsEnabled: false,
    higherLimits: true,
    premiumTools: false,
    teamsEnabled: false,
    maxTeamMembers: null,
    metadata: {},
    providerPriceIdMonthly: "price_monthly_123",
    providerPriceIdAnnual: "price_annual_123",
    ...overrides,
  };
}

describe("entitlementsFromPlan", () => {
  it("derives entitlements directly from the plan's own flags — never independently", () => {
    const plan = makePlan();
    expect(entitlementsFromPlan(plan)).toEqual({
      planId: "pro",
      planName: "Pro",
      adsEnabled: false,
      higherLimits: true,
      premiumTools: false,
      teamsEnabled: false,
      maxTeamMembers: null,
      metadata: {},
    });
  });

  it("reflects a team plan's higher member cap", () => {
    const plan = makePlan({ id: "team", teamsEnabled: true, maxTeamMembers: 5 });
    expect(entitlementsFromPlan(plan).maxTeamMembers).toBe(5);
    expect(entitlementsFromPlan(plan).teamsEnabled).toBe(true);
  });

  it("carries plan.metadata through unchanged — the escape hatch for future per-plan limits", () => {
    const plan = makePlan({ metadata: { pdf_daily_limit: 100, founding: true } });
    expect(entitlementsFromPlan(plan).metadata).toEqual({ pdf_daily_limit: 100, founding: true });
  });

  it("works for a plan id the code has never seen before — no exhaustive union to update", () => {
    const plan = makePlan({ id: "pro_founding", name: "Pro fundador" });
    expect(entitlementsFromPlan(plan).planId).toBe("pro_founding");
    expect(entitlementsFromPlan(plan).planName).toBe("Pro fundador");
  });
});

describe("FALLBACK_FREE_ENTITLEMENTS", () => {
  it("is the safe, ads-on, nothing-unlocked default", () => {
    expect(FALLBACK_FREE_ENTITLEMENTS.planId).toBe(FREE_PLAN_ID);
    expect(FALLBACK_FREE_ENTITLEMENTS.adsEnabled).toBe(true);
    expect(FALLBACK_FREE_ENTITLEMENTS.higherLimits).toBe(false);
    expect(FALLBACK_FREE_ENTITLEMENTS.premiumTools).toBe(false);
    expect(FALLBACK_FREE_ENTITLEMENTS.teamsEnabled).toBe(false);
  });
});
