import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { BillingInterval, PlanId, SubscriptionStatus } from "@/lib/supabase/database.types";

export interface SubscriptionSummary {
  planId: PlanId;
  billingInterval: BillingInterval | null;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  provider: string;
  providerCustomerId: string | null;
  providerSubscriptionId: string | null;
}

/**
 * The user's own personal subscription (not one inherited from a team) —
 * used only for display on the account page (renewal date, cancel state)
 * and to know which processor/ids to call for portal/cancel actions.
 * Entitlements resolution (`getEntitlements`) remains the source of truth
 * for what the user can actually do; this is presentation + billing-action
 * plumbing only.
 */
export const getPersonalSubscription = cache(async (userId: string): Promise<SubscriptionSummary | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select(
      "plan_id, billing_interval, status, current_period_end, cancel_at_period_end, provider, provider_customer_id, provider_subscription_id",
    )
    .eq("user_id", userId)
    .in("status", ["trialing", "active", "past_due", "canceled"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return {
    planId: data.plan_id,
    billingInterval: data.billing_interval,
    status: data.status,
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: data.cancel_at_period_end,
    provider: data.provider,
    providerCustomerId: data.provider_customer_id,
    providerSubscriptionId: data.provider_subscription_id,
  };
});
