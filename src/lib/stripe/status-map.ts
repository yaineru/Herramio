import type { SubscriptionStatus } from "@/lib/supabase/database.types";

// Stripe has two statuses our schema doesn't model 1:1 (incomplete_expired,
// paused) — both mean "not a payable, active thing" from this app's point
// of view, so they collapse to "canceled" rather than growing the enum.
const STRIPE_STATUS_MAP: Record<string, SubscriptionStatus> = {
  trialing: "trialing",
  active: "active",
  past_due: "past_due",
  canceled: "canceled",
  incomplete: "incomplete",
  incomplete_expired: "canceled",
  unpaid: "unpaid",
  paused: "canceled",
};

export function mapStripeSubscriptionStatus(stripeStatus: string): SubscriptionStatus {
  return STRIPE_STATUS_MAP[stripeStatus] ?? "incomplete";
}
