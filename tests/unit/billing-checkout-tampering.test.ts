import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * What a hostile client can and cannot do to checkout.
 *
 * `createCheckoutSessionAction` is a Server Action, which means it is a
 * public HTTP endpoint. Anyone can call it with any arguments they like;
 * that the pricing page only ever sends valid ones proves nothing. So the
 * question these tests answer is not "does the button work" but "what
 * happens when someone calls this directly with values chosen to cheat".
 *
 * The design that makes the answers boring: the action accepts only a plan
 * id and an interval. There is no amount, no price and no user id in the
 * signature at all, so the interesting attacks are not defended against —
 * they are unexpressible. These tests exist to keep it that way, because
 * adding an `amount` parameter later would look perfectly reasonable in
 * isolation.
 */

const { getCurrentUser, getPlanById, createCheckoutSession, redirect } = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getPlanById: vi.fn(),
  createCheckoutSession: vi.fn(),
  redirect: vi.fn((url: string) => {
    // Next implements redirect() by throwing; mirroring that keeps the
    // control flow under test identical to production.
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser }));
vi.mock("@/lib/plans/queries", () => ({ getPlanById }));
vi.mock("@/lib/subscriptions/queries", () => ({ getPersonalSubscription: vi.fn() }));
vi.mock("@/lib/billing/get-provider", () => ({
  getBillingProvider: () => ({ name: "mercadopago", createCheckoutSession }),
}));

const { createCheckoutSessionAction } = await import("@/lib/billing/actions");

/** The real Pro row, with the real Mercado Pago plan ids and COP prices. */
const PRO = {
  id: "pro",
  name: "Pro",
  currency: "cop",
  monthlyPriceCents: 2_990_000,
  annualPriceCents: 29_900_000,
  providerPriceIdMonthly: "f752a4e49c70436e9c6b4a453035a606",
  providerPriceIdAnnual: "3d37fa0a6fea499a802aae7b2628ce4b",
};

const TEAM = {
  id: "team",
  name: "Equipos",
  currency: "cop",
  monthlyPriceCents: 7_990_000,
  annualPriceCents: null,
  providerPriceIdMonthly: "fc83cd823f3648c88d159a68ea7fbe44",
  providerPriceIdAnnual: null,
};

/** Runs the action and returns where it redirected, swallowing the throw. */
async function run(planId: string, interval: string): Promise<string> {
  try {
    await createCheckoutSessionAction(planId as never, interval as never);
    return "NO_REDIRECT";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return message.startsWith("REDIRECT:") ? message.slice("REDIRECT:".length) : `THREW:${message}`;
  }
}

beforeEach(() => {
  getCurrentUser.mockReset().mockResolvedValue({ id: "user-real", email: "real@example.com" });
  getPlanById.mockReset();
  createCheckoutSession.mockReset().mockResolvedValue({ url: "https://mp.example/checkout" });
});

describe("the price comes from the database, never from the caller", () => {
  it("sends the stored Mercado Pago plan id for a monthly checkout", async () => {
    getPlanById.mockResolvedValue(PRO);
    await run("pro", "month");
    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({ providerPriceId: PRO.providerPriceIdMonthly, planId: "pro", interval: "month" }),
    );
  });

  it("sends the ANNUAL plan id for an annual checkout, not the monthly one", async () => {
    // Crossing these would charge 29.900 for a year or 299.000 for a month.
    getPlanById.mockResolvedValue(PRO);
    await run("pro", "year");
    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({ providerPriceId: PRO.providerPriceIdAnnual, interval: "year" }),
    );
  });

  it("never passes an amount to the provider at all", async () => {
    // The amount lives in the plan on Mercado Pago's side. Nothing this
    // process sends can change what is charged.
    getPlanById.mockResolvedValue(PRO);
    await run("pro", "month");
    const payload = createCheckoutSession.mock.calls[0][0];
    for (const forbidden of ["amount", "price", "transaction_amount", "priceCents", "total"]) {
      expect(payload).not.toHaveProperty(forbidden);
    }
  });

  it("keeps Pro and Team on their own plan ids", async () => {
    // Asking for Team must not reach Pro's cheaper plan.
    getPlanById.mockResolvedValue(TEAM);
    await run("team", "month");
    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({ providerPriceId: TEAM.providerPriceIdMonthly, planId: "team" }),
    );
  });
});

describe("the buyer is the session user, never an argument", () => {
  it("attributes checkout to the signed-in user", async () => {
    getPlanById.mockResolvedValue(PRO);
    await run("pro", "month");
    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-real", customerEmail: "real@example.com" }),
    );
  });

  it("cannot be made to buy on behalf of someone else", async () => {
    // There is no user parameter to forge. The action reads the session,
    // so a caller supplying extra arguments changes nothing.
    getPlanById.mockResolvedValue(PRO);
    await (createCheckoutSessionAction as unknown as (...a: unknown[]) => Promise<void>)(
      "pro",
      "month",
      "user-victim",
    ).catch(() => {});
    expect(createCheckoutSession).toHaveBeenCalledWith(expect.objectContaining({ userId: "user-real" }));
  });

  it("sends an anonymous caller to sign in and starts no checkout", async () => {
    getCurrentUser.mockResolvedValue(null);
    expect(await run("pro", "month")).toBe("/iniciar-sesion?next=/precios");
    expect(createCheckoutSession).not.toHaveBeenCalled();
  });
});

describe("plans that cannot be bought are refused, not improvised", () => {
  it("refuses a plan id that does not exist", async () => {
    getPlanById.mockResolvedValue(null);
    expect(await run("pro-gratis-por-favor", "month")).toBe("/precios?error=plan_no_disponible");
    expect(createCheckoutSession).not.toHaveBeenCalled();
  });

  it("refuses the free plan rather than starting a zero checkout", async () => {
    getPlanById.mockResolvedValue({ id: "free", providerPriceIdMonthly: null, providerPriceIdAnnual: null });
    expect(await run("free", "month")).toBe("/precios?error=plan_no_disponible");
    expect(createCheckoutSession).not.toHaveBeenCalled();
  });

  it("refuses an annual checkout for a plan sold only monthly", async () => {
    // Team has no annual price id. Falling back to the monthly one would
    // charge 79.900 for a year.
    getPlanById.mockResolvedValue(TEAM);
    expect(await run("team", "year")).toBe("/precios?error=plan_no_disponible");
    expect(createCheckoutSession).not.toHaveBeenCalled();
  });

  it("reports a provider failure instead of proceeding as if it worked", async () => {
    getPlanById.mockResolvedValue(PRO);
    createCheckoutSession.mockRejectedValue(new Error("mercadopago down"));
    expect(await run("pro", "month")).toBe("/precios?error=pagos_no_configurados");
  });
});

describe("returning from the processor grants nothing", () => {
  it("points the success url at a page that only reports pending verification", async () => {
    // The subscription is written by the webhook, never by this redirect.
    // If landing on /cuenta granted Pro, anyone could type the URL.
    getPlanById.mockResolvedValue(PRO);
    await run("pro", "month");
    const { successUrl, cancelUrl } = createCheckoutSession.mock.calls[0][0];
    expect(successUrl).toContain("/cuenta");
    expect(cancelUrl).toContain("/precios");
  });
});
