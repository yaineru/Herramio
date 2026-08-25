import type { SubscriptionStatus } from "@/lib/supabase/database.types";

// Mercado Pago's PreApproval status set is smaller than Stripe's — no
// direct equivalent of "trialing", "unpaid", or "incomplete_expired".
// "paused" is the least-bad mapping to "past_due": it isn't a hard
// cancellation, but it also isn't actively billing, so it shouldn't read
// as fully "active" either.
const MP_STATUS_MAP: Record<string, SubscriptionStatus> = {
  pending: "incomplete",
  authorized: "active",
  paused: "past_due",
  cancelled: "canceled",
};

export function mapMercadoPagoSubscriptionStatus(mpStatus: string | undefined): SubscriptionStatus {
  if (!mpStatus) return "incomplete";
  return MP_STATUS_MAP[mpStatus] ?? "incomplete";
}
