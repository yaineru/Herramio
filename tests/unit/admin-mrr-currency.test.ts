import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * MRR has to know what currency it is in.
 *
 * The admin panel hardcoded "usd" when formatting this number. That was
 * harmless while every plan was priced in dollars and became wrong the
 * moment pricing moved to Colombian pesos: 29.900 COP would have rendered
 * as $29,900.00 USD, overstating revenue by roughly four thousand times.
 *
 * A currency is not a display detail on a revenue figure. It is half the
 * number.
 */

const { from } = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from }) }));
vi.mock("@/lib/tools/registry", () => ({ getToolById: () => null }));

const { getAdminMetrics } = await import("@/lib/admin/metrics");

type Sub = { user_id: string | null; workspace_id: string | null; plan_id: string; billing_interval: string; status: string };
type Plan = { id: string; monthly_price_cents: number | null; annual_price_cents: number | null; currency: string };

/** Minimal PostgREST-shaped stub: every builder method returns the same thenable. */
function table(rows: unknown[], count = 0) {
  const chain: Record<string, unknown> = {
    select: () => chain,
    eq: () => chain,
    in: () => chain,
    gte: () => chain,
    order: () => chain,
    limit: () => chain,
    then: (resolve: (v: unknown) => unknown) => resolve({ data: rows, count, error: null }),
  };
  return chain;
}

function setup(subs: Sub[], plans: Plan[]) {
  from.mockImplementation((name: string) => {
    if (name === "subscriptions") return table(subs);
    if (name === "plans") return table(plans);
    if (name === "profiles") return table([], 0);
    return table([]);
  });
}

const COP_PRO: Plan = { id: "pro", monthly_price_cents: 2_990_000, annual_price_cents: 29_900_000, currency: "cop" };
const COP_TEAM: Plan = { id: "team", monthly_price_cents: 7_990_000, annual_price_cents: null, currency: "cop" };
const USD_LEGACY: Plan = { id: "legacy", monthly_price_cents: 399, annual_price_cents: null, currency: "usd" };

const sub = (planId: string, interval = "month", status = "active"): Sub => ({
  user_id: "u1",
  workspace_id: null,
  plan_id: planId,
  billing_interval: interval,
  status,
});

beforeEach(() => from.mockReset());

describe("MRR carries the currency of the plans that produced it", () => {
  it("reports COP when every contributing plan is priced in COP", async () => {
    setup([sub("pro"), sub("team")], [COP_PRO, COP_TEAM]);
    const m = await getAdminMetrics();
    expect(m.mrrCurrency).toBe("cop");
    expect(m.mrrCents).toBe(2_990_000 + 7_990_000);
  });

  it("divides an annual subscription across twelve months", async () => {
    setup([sub("pro", "year")], [COP_PRO]);
    const m = await getAdminMetrics();
    expect(m.mrrCents).toBe(Math.round(29_900_000 / 12));
    expect(m.mrrCurrency).toBe("cop");
  });

  it("refuses to name a currency when plans disagree", async () => {
    // The sum of COP cents and USD cents is not money. Better to show
    // nothing than to put a symbol in front of it.
    setup([sub("pro"), sub("legacy")], [COP_PRO, USD_LEGACY]);
    expect((await getAdminMetrics()).mrrCurrency).toBeNull();
  });

  it("reports no currency when there is no revenue yet", async () => {
    setup([], [COP_PRO]);
    const m = await getAdminMetrics();
    expect(m.mrrCents).toBe(0);
    expect(m.mrrCurrency).toBeNull();
  });

  it("excludes past_due from MRR and from the currency it reports", async () => {
    // Revenue that has not been collected is not recurring revenue.
    setup([sub("pro"), sub("legacy", "month", "past_due")], [COP_PRO, USD_LEGACY]);
    const m = await getAdminMetrics();
    expect(m.mrrCents).toBe(2_990_000);
    expect(m.mrrCurrency).toBe("cop");
    expect(m.pastDueCount).toBe(1);
  });

  it("ignores a subscription whose plan no longer exists", async () => {
    setup([sub("deleted-plan")], [COP_PRO]);
    const m = await getAdminMetrics();
    expect(m.mrrCents).toBe(0);
    expect(m.mrrCurrency).toBeNull();
  });
});
