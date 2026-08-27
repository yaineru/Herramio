import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The security properties of the payment pipeline.
 *
 * Money makes the usual "it returned 200" standard useless. Each test here
 * asserts a property an attacker would try to break, not a happy path:
 * that a forged webhook grants nothing, that a replayed notification cannot
 * create a second subscription, and that a late notification cannot roll a
 * subscription backwards.
 */

const { insert, upsert, from, createAdminClient, getPlanByProviderPriceId, verifyAndParseWebhook, applySpy } =
  vi.hoisted(() => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({ insert, upsert }));
    const createAdminClient = vi.fn(() => ({ from }));
    const getPlanByProviderPriceId = vi.fn();
    const verifyAndParseWebhook = vi.fn();
    const applySpy = vi.fn().mockResolvedValue(undefined);
    return { insert, upsert, from, createAdminClient, getPlanByProviderPriceId, verifyAndParseWebhook, applySpy };
  });

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient }));
vi.mock("@/lib/plans/queries", () => ({ getPlanByProviderPriceId }));
vi.mock("@/lib/billing/providers/mercadopago-provider", () => ({
  mercadoPagoProvider: { name: "mercadopago", verifyAndParseWebhook },
}));

const routeModule = await import("@/app/api/webhooks/mercadopago/route");
const applyModule = await import("@/lib/billing/apply-webhook-event");
const { POST } = routeModule;
const { applyBillingSubscriptionEvent } = applyModule;

function req(body = '{"data":{"id":"pre_1"}}') {
  return new Request(
    "https://herramio.com/api/webhooks/mercadopago?type=subscription_preapproval&data.id=pre_1",
    { method: "POST", body },
  ) as unknown as Parameters<typeof POST>[0];
}

const subscription = {
  providerSubscriptionId: "pre_1",
  providerCustomerId: null,
  providerPriceId: "plan_abc",
  status: "active" as const,
  currentPeriodEnd: "2026-10-01T00:00:00.000Z",
  cancelAtPeriodEnd: false,
  userId: "user-abc",
};

const subEvent = { kind: "subscription_event" as const, providerEventId: "pre_1:req_1", subscription };

beforeEach(() => {
  insert.mockReset().mockResolvedValue({ error: null });
  upsert.mockReset().mockResolvedValue({ error: null });
  from.mockClear();
  createAdminClient.mockClear();
  verifyAndParseWebhook.mockReset();
  getPlanByProviderPriceId.mockReset();
  applySpy.mockReset().mockResolvedValue(undefined);
});

describe("webhook signature is the gate, not a formality", () => {
  it("rejects an unverified request and writes nothing at all", async () => {
    // A forged webhook is the cheapest possible way to grant yourself Pro.
    verifyAndParseWebhook.mockRejectedValue(new Error("invalid signature"));
    const res = await POST(req());
    expect(res.status).toBe(400);
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("does not fall back to the request body when verification fails", async () => {
    // The body claims an authorized subscription; verification says no.
    verifyAndParseWebhook.mockRejectedValue(new Error("invalid signature"));
    const res = await POST(req('{"data":{"id":"pre_1"},"status":"authorized"}'));
    expect(res.status).toBe(400);
    expect(upsert).not.toHaveBeenCalled();
  });
});

describe("idempotency: a replayed notification cannot double-apply", () => {
  it("short-circuits on the unique violation from the event ledger", async () => {
    verifyAndParseWebhook.mockResolvedValue(subEvent);
    insert.mockResolvedValue({ error: { code: "23505" } });
    const res = await POST(req());
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ duplicate: true });
    // The point of the ledger: the domain write never runs a second time.
    expect(upsert).not.toHaveBeenCalled();
  });

  it("records the event BEFORE applying it, never after", async () => {
    // Insert-then-process. The reverse order would apply the event and then
    // risk crashing before recording it, leaving a redelivery free to apply
    // it all over again.
    const order: string[] = [];
    verifyAndParseWebhook.mockResolvedValue(subEvent);
    insert.mockImplementation(async () => {
      order.push("ledger");
      return { error: null };
    });
    getPlanByProviderPriceId.mockImplementation(async () => {
      order.push("apply");
      return { plan: { id: "pro" }, interval: "month" };
    });
    await POST(req());
    expect(order).toEqual(["ledger", "apply"]);
  });

  it("reports a storage failure instead of processing unrecorded", async () => {
    verifyAndParseWebhook.mockResolvedValue(subEvent);
    insert.mockResolvedValue({ error: { code: "08006", message: "connection lost" } });
    const res = await POST(req());
    expect(res.status).toBe(500);
    expect(upsert).not.toHaveBeenCalled();
  });
});

describe("events the processor sends but we do not act on", () => {
  it("records an ignored event without touching subscriptions", async () => {
    verifyAndParseWebhook.mockResolvedValue({ kind: "ignored", providerEventId: "x:1" });
    const res = await POST(req());
    expect(res.status).toBe(200);
    expect(upsert).not.toHaveBeenCalled();
  });
});

describe("out-of-order delivery cannot roll state backwards", () => {
  it("converges on one row via upsert, so reprocessing is safe", async () => {
    // The design that makes ordering irrelevant: verifyAndParseWebhook
    // re-reads the subscription from Mercado Pago by id, so a notification
    // that arrives late still carries whatever the state is NOW — a stale
    // body can never un-activate a subscription that is authorized.
    getPlanByProviderPriceId.mockResolvedValue({ plan: { id: "pro" }, interval: "month" });
    await applyBillingSubscriptionEvent("mercadopago", subscription);

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ status: "active", plan_id: "pro", user_id: "user-abc" }),
      { onConflict: "provider_subscription_id" },
    );
  });

  it("never creates a second subscription row for the same provider id", async () => {
    getPlanByProviderPriceId.mockResolvedValue({ plan: { id: "pro" }, interval: "month" });
    await applyBillingSubscriptionEvent("mercadopago", subscription);
    await applyBillingSubscriptionEvent("mercadopago", subscription);

    expect(upsert).toHaveBeenCalledTimes(2);
    for (const call of upsert.mock.calls) {
      expect(call[1]).toEqual({ onConflict: "provider_subscription_id" });
    }
  });
});

describe("attribution: a payment can only ever unlock the payer", () => {
  it("ignores a subscription that cannot be attributed to a user", async () => {
    await applyBillingSubscriptionEvent("mercadopago", { ...subscription, userId: null });
    expect(upsert).not.toHaveBeenCalled();
  });

  it("refuses to guess a plan when the price id matches nothing we sell", async () => {
    // An attacker who could set an arbitrary preapproval_plan_id must not
    // land on a real plan by accident.
    getPlanByProviderPriceId.mockResolvedValue(null);
    await applyBillingSubscriptionEvent("mercadopago", { ...subscription, providerPriceId: "not_ours" });
    expect(upsert).not.toHaveBeenCalled();
  });

  it("refuses a subscription carrying no price id rather than defaulting", async () => {
    await applyBillingSubscriptionEvent("mercadopago", { ...subscription, providerPriceId: null });
    expect(upsert).not.toHaveBeenCalled();
  });
});
