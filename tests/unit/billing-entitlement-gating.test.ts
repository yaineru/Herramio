import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Which subscription states actually unlock a paid plan.
 *
 * This is the last gate before a feature opens, and the one that decides
 * whether someone who started a checkout and never paid gets Pro anyway.
 * Mercado Pago reports an unpaid subscription as `pending`, which this
 * codebase maps to `incomplete`; if `incomplete` counted as active, every
 * abandoned checkout would hand out a free upgrade.
 *
 * The mock deliberately HONOURS the `.in(status, ...)` filter instead of
 * returning whatever row the test hands it. A mock that ignores the filter
 * would pass no matter what the query asked for, which would make these
 * tests decorative — the filter IS the security control.
 */

const { createClient, getCurrentUser, getPlanById } = vi.hoisted(() => ({
  createClient: vi.fn(),
  getCurrentUser: vi.fn(),
  getPlanById: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser }));
vi.mock("@/lib/plans/queries", () => ({ getPlanById }));

const { getEntitlements } = await import("@/lib/auth/entitlements");

interface Row {
  plan_id: string;
  status: string;
}

/**
 * Builds a Supabase stub whose `subscriptions` query applies the status
 * filter for real.
 */
function dbWith({ personal, memberships = [], team }: { personal?: Row; memberships?: string[]; team?: Row }) {
  return {
    from(table: string) {
      if (table === "workspace_members") {
        const chain: Record<string, unknown> = {
          select: () => chain,
          eq: async () => ({ data: memberships.map((id) => ({ workspace_id: id })) }),
        };
        return chain;
      }

      // subscriptions
      let allowed: string[] = [];
      let scopedToWorkspace = false;
      const chain: Record<string, unknown> = {
        select: () => chain,
        eq: () => chain,
        in: (column: string, values: string[]) => {
          if (column === "status") allowed = values;
          else scopedToWorkspace = true;
          return chain;
        },
        limit: () => chain,
        maybeSingle: async () => {
          const row = scopedToWorkspace ? team : personal;
          if (!row) return { data: null };
          // The real filter: a row whose status is not in the allowed list
          // is simply not returned by Postgres.
          return { data: allowed.includes(row.status) ? row : null };
        },
      };
      return chain;
    },
  };
}

beforeEach(() => {
  getCurrentUser.mockReset().mockResolvedValue({ id: "u1" });
  getPlanById.mockReset().mockImplementation(async (id: string) => ({
    id,
    name: id,
    monthlyPriceCents: null,
    annualPriceCents: null,
    currency: "cop",
    adsEnabled: id === "free",
    higherLimits: id !== "free",
    premiumTools: id !== "free",
    teamsEnabled: id === "team",
    maxTeamMembers: id === "team" ? 5 : null,
    metadata: {},
  }));
  createClient.mockReset();
});

async function planFor(setup: Parameters<typeof dbWith>[0]) {
  createClient.mockResolvedValue(dbWith(setup));
  const entitlements = await getEntitlements();
  // Entitlements are derived from the resolved plan; premiumTools is the
  // cleanest read-out of "did this resolve to a paid plan".
  return entitlements.premiumTools ? "paid" : "free";
}

describe("only a verified, active subscription unlocks anything", () => {
  it("grants the plan when the subscription is active", async () => {
    expect(await planFor({ personal: { plan_id: "pro", status: "active" } })).toBe("paid");
  });

  it("does NOT grant anything while payment is still pending", async () => {
    // Mercado Pago's `pending` maps to `incomplete`. Someone who opened
    // checkout and walked away must stay on Free.
    expect(await planFor({ personal: { plan_id: "pro", status: "incomplete" } })).toBe("free");
  });

  it("does NOT grant anything for a canceled subscription", async () => {
    expect(await planFor({ personal: { plan_id: "pro", status: "canceled" } })).toBe("free");
  });

  it("does NOT grant anything for a rejected/incomplete_expired subscription", async () => {
    expect(await planFor({ personal: { plan_id: "pro", status: "incomplete_expired" } })).toBe("free");
  });

  it("keeps a past_due subscription active during the provider's grace period", async () => {
    // Deliberate: the processor has its own dunning window, and cutting
    // someone off before their own provider does is a support ticket, not
    // a security win.
    expect(await planFor({ personal: { plan_id: "pro", status: "past_due" } })).toBe("paid");
  });

  it("falls back to Free when there is no subscription at all", async () => {
    expect(await planFor({})).toBe("free");
  });

  it("falls back to Free for a signed-out visitor", async () => {
    getCurrentUser.mockResolvedValue(null);
    createClient.mockResolvedValue(dbWith({}));
    expect((await getEntitlements()).premiumTools).toBe(false);
  });
});

describe("team entitlements inherit the same rule", () => {
  it("grants a member the team plan when the team subscription is active", async () => {
    expect(await planFor({ memberships: ["ws1"], team: { plan_id: "team", status: "active" } })).toBe("paid");
  });

  it("does NOT grant a member anything while the team subscription is pending", async () => {
    expect(await planFor({ memberships: ["ws1"], team: { plan_id: "team", status: "incomplete" } })).toBe("free");
  });

  it("does not look for a team plan when the user belongs to no workspace", async () => {
    expect(await planFor({ memberships: [], team: { plan_id: "team", status: "active" } })).toBe("free");
  });
});
