import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanByProviderPriceId } from "@/lib/plans/queries";
import type { NormalizedSubscription } from "@/lib/billing/provider";

/**
 * The one place that turns a verified, normalized subscription event into
 * a database write — shared by every provider's webhook route, so the
 * actual business rule ("webhook is the only source of truth for
 * subscription state") lives in exactly one function regardless of how
 * many payment processors this app supports.
 */
export async function applyBillingSubscriptionEvent(providerName: string, sub: NormalizedSubscription): Promise<void> {
  if (!sub.userId) {
    console.warn(`[${providerName}] Subscription ${sub.providerSubscriptionId} has no attributable user; ignoring.`);
    return;
  }
  if (!sub.providerPriceId) {
    console.error(`[${providerName}] Subscription ${sub.providerSubscriptionId} carries no price id; cannot resolve a plan.`);
    return;
  }

  const match = await getPlanByProviderPriceId(sub.providerPriceId);
  if (!match) {
    console.error(`[${providerName}] Subscription ${sub.providerSubscriptionId}: no plan matches price ${sub.providerPriceId}.`);
    return;
  }

  const admin = createAdminClient();
  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: sub.userId,
      plan_id: match.plan.id,
      billing_interval: match.interval,
      status: sub.status,
      provider: providerName,
      provider_customer_id: sub.providerCustomerId,
      provider_subscription_id: sub.providerSubscriptionId,
      current_period_end: sub.currentPeriodEnd,
      cancel_at_period_end: sub.cancelAtPeriodEnd,
    },
    { onConflict: "provider_subscription_id" },
  );

  if (error) console.error(`[${providerName}] Failed to sync subscription ${sub.providerSubscriptionId}:`, error);
}
