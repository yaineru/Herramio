import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * How a Mercado Pago subscription checkout is actually started.
 *
 * These tests exist because the original implementation could not work.
 * It POSTed /preapproval with a payer_email, which the live API rejects
 * with `400 card_token_id is required` — every variant, measured against
 * the real endpoint. The card token is minted in the browser by MP.js from
 * card details a server must never touch, so there is no server-side way
 * to create a subscription at all. The only route is the plan's hosted
 * `init_point`.
 *
 * The failure was invisible in code review and invisible in unit tests
 * that mocked the SDK into succeeding: it only shows up when you call the
 * real API. So the point of the first test is not "the URL is built
 * correctly" but "we are not back on the endpoint that always 400s".
 */

const { planGet, preApprovalCreate, preApprovalGet, validate, getMercadoPagoConfig } = vi.hoisted(() => ({
  planGet: vi.fn(),
  preApprovalCreate: vi.fn(),
  preApprovalGet: vi.fn(),
  validate: vi.fn(),
  getMercadoPagoConfig: vi.fn(() => ({})),
}));

vi.mock("mercadopago", () => ({
  PreApprovalPlan: class {
    get = planGet;
  },
  PreApproval: class {
    create = preApprovalCreate;
    get = preApprovalGet;
    update = vi.fn();
  },
  WebhookSignatureValidator: { validate },
}));
vi.mock("@/lib/mercadopago/client", () => ({ getMercadoPagoConfig }));

const { mercadoPagoProvider } = await import("@/lib/billing/providers/mercadopago-provider");

const PLAN_ID = "f752a4e49c70436e9c6b4a453035a606";
const USER_ID = "3f8a1c2d-4b5e-4f60-9a71-2c3d4e5f6a7b";

const checkoutInput = {
  providerPriceId: PLAN_ID,
  interval: "month" as const,
  planId: "pro" as const,
  userId: USER_ID,
  customerEmail: "alguien@example.com",
  successUrl: "https://herramio.com/cuenta?checkout=exito",
  cancelUrl: "https://herramio.com/precios?checkout=cancelado",
};

beforeEach(() => {
  planGet.mockReset().mockResolvedValue({
    id: PLAN_ID,
    init_point: `https://www.mercadopago.com.co/subscriptions/checkout?preapproval_plan_id=${PLAN_ID}`,
  });
  preApprovalCreate.mockReset();
});

describe("checkout redirects to the plan's hosted page", () => {
  it("never calls the /preapproval create endpoint, which always 400s", async () => {
    await mercadoPagoProvider.createCheckoutSession(checkoutInput);
    expect(preApprovalCreate).not.toHaveBeenCalled();
    expect(planGet).toHaveBeenCalledWith({ preApprovalPlanId: PLAN_ID });
  });

  it("returns the plan's init_point for the requested plan", async () => {
    const { url } = await mercadoPagoProvider.createCheckoutSession(checkoutInput);
    expect(new URL(url).searchParams.get("preapproval_plan_id")).toBe(PLAN_ID);
  });

  it("carries the Herramio user id so the webhook can attribute the payment", async () => {
    // Without this the subscription arrives carrying the PLAN's own
    // reference and belongs to nobody.
    const { url } = await mercadoPagoProvider.createCheckoutSession(checkoutInput);
    expect(new URL(url).searchParams.get("external_reference")).toBe(USER_ID);
  });

  it("does not lose the query parameters already on the init_point", async () => {
    const { url } = await mercadoPagoProvider.createCheckoutSession(checkoutInput);
    const params = new URL(url).searchParams;
    expect(params.get("preapproval_plan_id")).toBe(PLAN_ID);
    expect(params.get("external_reference")).toBe(USER_ID);
  });

  it("fails loudly when the plan has no init_point rather than returning a dead link", async () => {
    planGet.mockResolvedValue({ id: PLAN_ID });
    await expect(mercadoPagoProvider.createCheckoutSession(checkoutInput)).rejects.toThrow(/init_point/);
  });
});

describe("only a real user id counts as attribution", () => {
  /** Drives the real webhook path so toNormalizedSubscription actually runs. */
  async function normalise(externalReference: string | undefined) {
    process.env.MERCADOPAGO_WEBHOOK_SECRET = "secreto-de-prueba";
    validate.mockReturnValue(true);
    preApprovalGet.mockResolvedValue({
      id: "pre_1",
      status: "authorized",
      external_reference: externalReference,
      preapproval_plan_id: PLAN_ID,
      next_payment_date: "2026-10-01T00:00:00.000Z",
    });

    const event = await mercadoPagoProvider.verifyAndParseWebhook({
      rawBody: JSON.stringify({ data: { id: "pre_1" } }),
      headers: new Headers({ "x-signature": "ts=1,v1=abc", "x-request-id": "req-1" }),
      url: new URL("https://herramio.com/api/webhooks/mercadopago?type=subscription_preapproval&data.id=pre_1"),
    });
    if (event.kind !== "subscription_event") throw new Error("se esperaba un subscription_event");
    return event.subscription;
  }

  it("accepts a Supabase auth uuid as the buyer", async () => {
    const sub = await normalise(USER_ID);
    expect(sub.userId).toBe(USER_ID);
    expect(sub.status).toBe("active");
  });

  it("treats the PLAN's own reference as unattributable, not as a user id", async () => {
    // The plan carries external_reference "HERRAMIO_PRO_MONTHLY". If a
    // subscription ever inherits it instead of the id attached at
    // checkout, that string must never be written into subscriptions.user_id.
    const sub = await normalise("HERRAMIO_PRO_MONTHLY");
    expect(sub.userId).toBeNull();
  });

  it("treats a missing reference as unattributable", async () => {
    expect((await normalise(undefined)).userId).toBeNull();
  });

  it("rejects an arbitrary string someone might inject as a reference", async () => {
    expect((await normalise("../../admin")).userId).toBeNull();
  });

  it("still reports the plan id so an unattributable event is diagnosable", async () => {
    const sub = await normalise("HERRAMIO_PRO_MONTHLY");
    expect(sub.providerPriceId).toBe(PLAN_ID);
  });
});
