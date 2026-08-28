import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Recurring charges: the `subscription_authorized_payment` topic.
 *
 * Mercado Pago sends this for each installment of a subscription. Its
 * `data.id` is an INVOICE id, not a subscription id, so it has to be
 * resolved before it means anything — reading it as a preapproval id
 * would look up a subscription that does not exist.
 *
 * The property these tests protect is what the handler refuses to do:
 * derive subscription state from a payment. Mercado Pago retries a
 * declined charge (`recycling`) for up to ten days and only then cancels
 * the subscription, sending that as a `subscription_preapproval` event.
 * So one failed installment must NOT revoke access — the provider still
 * considers the subscription live, and cutting the user off early would
 * be inventing a state nobody reported.
 */

const { planGet, preApprovalGet, validate, getMercadoPagoConfig } = vi.hoisted(() => ({
  planGet: vi.fn(),
  preApprovalGet: vi.fn(),
  validate: vi.fn(),
  getMercadoPagoConfig: vi.fn(() => ({})),
}));

vi.mock("mercadopago", () => ({
  PreApprovalPlan: class {
    get = planGet;
  },
  PreApproval: class {
    get = preApprovalGet;
    create = vi.fn();
    update = vi.fn();
  },
  WebhookSignatureValidator: { validate },
}));
vi.mock("@/lib/mercadopago/client", () => ({ getMercadoPagoConfig }));

const { mercadoPagoProvider } = await import("@/lib/billing/providers/mercadopago-provider");

const SUB_ID = "71541d4c4bf14f83ac958ee7dfb2bc84";
const INVOICE_ID = "inv_9988776655";
const USER_ID = "b843eccd-8fb4-4394-884a-0e099cae8a92";
const PLAN_ID = "f752a4e49c70436e9c6b4a453035a606";

const realFetch = globalThis.fetch;

/** Stands in for GET /authorized_payments/{id}, which the SDK has no client for. */
function invoiceReturns(body: unknown, ok = true, status = 200) {
  globalThis.fetch = vi.fn(async (url: string | URL) => {
    expect(String(url)).toContain(`/authorized_payments/${INVOICE_ID}`);
    return { ok, status, json: async () => body } as unknown as Response;
  }) as unknown as typeof fetch;
}

function preapproval(status: string) {
  return {
    id: SUB_ID,
    status,
    external_reference: USER_ID,
    preapproval_plan_id: PLAN_ID,
    next_payment_date: "2026-10-27T00:00:00.000Z",
  };
}

async function receive(type: string, resourceId: string) {
  return mercadoPagoProvider.verifyAndParseWebhook({
    rawBody: JSON.stringify({ type, data: { id: resourceId } }),
    headers: new Headers({ "x-signature": "ts=1,v1=abc", "x-request-id": "req-1" }),
    url: new URL(`https://herramio.com/api/webhooks/mercadopago?type=${type}&data.id=${resourceId}`),
  });
}

beforeEach(() => {
  process.env.MERCADOPAGO_WEBHOOK_SECRET = "secreto-de-prueba";
  process.env.MERCADOPAGO_ACCESS_TOKEN = "token-de-prueba";
  validate.mockReset().mockReturnValue(true);
  preApprovalGet.mockReset().mockResolvedValue(preapproval("authorized"));
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("a renewal resolves its invoice to a subscription", () => {
  it("looks the invoice up and re-reads the subscription it belongs to", async () => {
    invoiceReturns({ id: INVOICE_ID, preapproval_id: SUB_ID, status: "processed" });
    const event = await receive("subscription_authorized_payment", INVOICE_ID);

    expect(event.kind).toBe("subscription_event");
    // The state comes from the SUBSCRIPTION, never from the invoice.
    expect(preApprovalGet).toHaveBeenCalledWith({ id: SUB_ID });
    if (event.kind !== "subscription_event") throw new Error("unreachable");
    expect(event.subscription.providerSubscriptionId).toBe(SUB_ID);
    expect(event.subscription.userId).toBe(USER_ID);
    expect(event.subscription.status).toBe("active");
  });

  it("never treats the invoice id as a subscription id", async () => {
    invoiceReturns({ id: INVOICE_ID, preapproval_id: SUB_ID, status: "processed" });
    await receive("subscription_authorized_payment", INVOICE_ID);
    expect(preApprovalGet).not.toHaveBeenCalledWith({ id: INVOICE_ID });
  });

  it("ignores an invoice that resolves to no subscription", async () => {
    invoiceReturns({ id: INVOICE_ID });
    expect((await receive("subscription_authorized_payment", INVOICE_ID)).kind).toBe("ignored");
    expect(preApprovalGet).not.toHaveBeenCalled();
  });

  it("ignores the event when the invoice lookup fails, rather than throwing", async () => {
    // Throwing would answer Mercado Pago with a 500 and invite it to retry
    // a request that will fail identically every time.
    invoiceReturns({}, false, 404);
    expect((await receive("subscription_authorized_payment", INVOICE_ID)).kind).toBe("ignored");
  });

  it("ignores the event when the network call throws outright", async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error("ECONNRESET");
    }) as unknown as typeof fetch;
    expect((await receive("subscription_authorized_payment", INVOICE_ID)).kind).toBe("ignored");
  });
});

describe("a failed charge does not decide access on its own", () => {
  it("keeps the subscription active while Mercado Pago is still retrying", async () => {
    // Invoice declined and recycling, but the subscription is still
    // authorized. Revoking here would cut off a user the provider still
    // considers paid up, for up to ten days of legitimate retries.
    invoiceReturns({ id: INVOICE_ID, preapproval_id: SUB_ID, status: "recycling", retry_attempt: 2 });
    const event = await receive("subscription_authorized_payment", INVOICE_ID);
    if (event.kind !== "subscription_event") throw new Error("unreachable");
    expect(event.subscription.status).toBe("active");
  });

  it("reflects the cancellation once Mercado Pago gives up", async () => {
    // After three rejected installments Mercado Pago cancels the
    // subscription itself; the preapproval is what says so.
    invoiceReturns({ id: INVOICE_ID, preapproval_id: SUB_ID, status: "recycling" });
    preApprovalGet.mockResolvedValue(preapproval("cancelled"));
    const event = await receive("subscription_authorized_payment", INVOICE_ID);
    if (event.kind !== "subscription_event") throw new Error("unreachable");
    expect(event.subscription.status).toBe("canceled");
  });

  it("maps a paused subscription to past_due, not to cancelled", async () => {
    invoiceReturns({ id: INVOICE_ID, preapproval_id: SUB_ID, status: "recycling" });
    preApprovalGet.mockResolvedValue(preapproval("paused"));
    const event = await receive("subscription_authorized_payment", INVOICE_ID);
    if (event.kind !== "subscription_event") throw new Error("unreachable");
    expect(event.subscription.status).toBe("past_due");
  });
});

describe("topics we record but do not act on", () => {
  for (const topic of ["subscription_preapproval_plan", "payment", "merchant_order", "chargebacks"]) {
    it(`ignores ${topic}`, async () => {
      const event = await receive(topic, "whatever-id");
      expect(event.kind).toBe("ignored");
      expect(preApprovalGet).not.toHaveBeenCalled();
    });
  }
});

describe("a renewal is still subject to every other rule", () => {
  it("is rejected outright when the signature does not verify", async () => {
    validate.mockImplementation(() => {
      throw new Error("InvalidWebhookSignatureError");
    });
    await expect(receive("subscription_authorized_payment", INVOICE_ID)).rejects.toThrow();
  });

  it("grants nobody anything when the subscription is unattributable", async () => {
    invoiceReturns({ id: INVOICE_ID, preapproval_id: SUB_ID, status: "processed" });
    preApprovalGet.mockResolvedValue({ ...preapproval("authorized"), external_reference: "HERRAMIO_PRO_MONTHLY" });
    const event = await receive("subscription_authorized_payment", INVOICE_ID);
    if (event.kind !== "subscription_event") throw new Error("unreachable");
    expect(event.subscription.userId).toBeNull();
  });

  it("produces a stable event id so a redelivery is deduplicated by the ledger", async () => {
    invoiceReturns({ id: INVOICE_ID, preapproval_id: SUB_ID, status: "processed" });
    const a = await receive("subscription_authorized_payment", INVOICE_ID);
    invoiceReturns({ id: INVOICE_ID, preapproval_id: SUB_ID, status: "processed" });
    const b = await receive("subscription_authorized_payment", INVOICE_ID);
    expect(a.providerEventId).toBe(b.providerEventId);
  });
});

describe("monthly and annual never swap", () => {
  // The reverse of the checkout-side test: whichever plan id arrives, the
  // subscription must carry that plan id back out unchanged, so the
  // lookup that turns it into plan+interval cannot land on the other one.
  it("carries the monthly plan id through untouched", async () => {
    invoiceReturns({ id: INVOICE_ID, preapproval_id: SUB_ID, status: "processed" });
    const event = await receive("subscription_authorized_payment", INVOICE_ID);
    if (event.kind !== "subscription_event") throw new Error("unreachable");
    expect(event.subscription.providerPriceId).toBe(PLAN_ID);
  });

  it("carries the annual plan id through untouched", async () => {
    const ANNUAL = "3d37fa0a6fea499a802aae7b2628ce4b";
    invoiceReturns({ id: INVOICE_ID, preapproval_id: SUB_ID, status: "processed" });
    preApprovalGet.mockResolvedValue({ ...preapproval("authorized"), preapproval_plan_id: ANNUAL });
    const event = await receive("subscription_authorized_payment", INVOICE_ID);
    if (event.kind !== "subscription_event") throw new Error("unreachable");
    expect(event.subscription.providerPriceId).toBe(ANNUAL);
  });
});
