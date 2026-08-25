import { describe, it, expect, vi, beforeEach } from "vitest";

const { upsert, from, createAdminClient, getPlanByProviderPriceId } = vi.hoisted(() => {
  const upsert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn(() => ({ upsert }));
  const createAdminClient = vi.fn(() => ({ from }));
  const getPlanByProviderPriceId = vi.fn();
  return { upsert, from, createAdminClient, getPlanByProviderPriceId };
});

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient }));
vi.mock("@/lib/plans/queries", () => ({ getPlanByProviderPriceId }));

import { applyBillingSubscriptionEvent } from "@/lib/billing/apply-webhook-event";
import type { NormalizedSubscription } from "@/lib/billing/provider";

function makeSub(overrides: Partial<NormalizedSubscription> = {}): NormalizedSubscription {
  return {
    providerSubscriptionId: "sub_123",
    providerCustomerId: "cus_123",
    providerPriceId: "price_123",
    status: "active",
    currentPeriodEnd: "2026-09-24T00:00:00.000Z",
    cancelAtPeriodEnd: false,
    userId: "user-abc",
    ...overrides,
  };
}

describe("applyBillingSubscriptionEvent", () => {
  beforeEach(() => {
    upsert.mockClear();
    from.mockClear();
    createAdminClient.mockClear();
    getPlanByProviderPriceId.mockReset();
  });

  it("writes nothing when the subscription has no attributable user", async () => {
    await applyBillingSubscriptionEvent("stripe", makeSub({ userId: null }));
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("writes nothing when the subscription carries no price id", async () => {
    await applyBillingSubscriptionEvent("stripe", makeSub({ providerPriceId: null }));
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("writes nothing when the price id matches no known plan", async () => {
    getPlanByProviderPriceId.mockResolvedValue(null);
    await applyBillingSubscriptionEvent("stripe", makeSub());
    expect(createAdminClient).not.toHaveBeenCalled();
  });

  it("upserts the resolved plan/interval on conflict provider_subscription_id, using the caller-supplied provider name (not something derived from client input)", async () => {
    getPlanByProviderPriceId.mockResolvedValue({ plan: { id: "pro" }, interval: "month" });

    await applyBillingSubscriptionEvent("mercadopago", makeSub());

    expect(from).toHaveBeenCalledWith("subscriptions");
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-abc",
        plan_id: "pro",
        billing_interval: "month",
        status: "active",
        provider: "mercadopago",
        provider_subscription_id: "sub_123",
      }),
      { onConflict: "provider_subscription_id" },
    );
  });
});
