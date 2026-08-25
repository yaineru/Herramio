import "server-only";
import type { BillingInterval, SubscriptionStatus } from "@/lib/supabase/database.types";

/**
 * The interface every payment processor implementation must satisfy. The
 * rest of the app (Server Actions, the account/pricing pages, the webhook
 * routes) talks only to this shape — never to a specific SDK — so which
 * processor is active is a config choice (`getBillingProvider()`), not an
 * architectural one. Add a new processor by adding a new file under
 * `providers/` that implements this interface; nothing else changes.
 */
export interface BillingProvider {
  /** Machine-readable id stored in `subscriptions.provider` — must match what the webhook route for this provider identifies itself as. */
  readonly name: string;

  /** Starts a hosted checkout for a plan; the caller redirects the browser to the returned URL. Never activates anything by itself. */
  createCheckoutSession(input: CreateCheckoutInput): Promise<{ url: string }>;

  /**
   * A processor-hosted self-service page (Stripe's Billing Portal) for
   * managing an existing subscription. Returns `null` when the processor
   * has no such concept (e.g. Mercado Pago) — callers must handle that by
   * falling back to `cancelSubscription` directly instead of a redirect.
   */
  createCustomerPortalSession(input: { providerCustomerId: string; returnUrl: string }): Promise<{ url: string } | null>;

  /** Cancels a subscription directly via the API — the fallback (or only) path when there's no customer portal. */
  cancelSubscription(providerSubscriptionId: string): Promise<void>;

  /**
   * Verifies and normalizes an inbound webhook request into a shape the
   * shared domain logic (`applyBillingWebhookEvent`) can act on without
   * knowing which processor sent it. Must verify the signature/secret
   * itself — never return a parsed event for a request that failed
   * verification.
   */
  verifyAndParseWebhook(input: WebhookVerifyInput): Promise<NormalizedWebhookEvent>;
}

export interface CreateCheckoutInput {
  /** The processor-side price/plan identifier to charge (plans.provider_price_id_monthly or _annual). */
  providerPriceId: string;
  interval: BillingInterval;
  /** Our internal plan id — carried through so the webhook can double-check it matches the price id's resolved plan. */
  planId: string;
  userId: string;
  customerEmail: string | null;
  successUrl: string;
  cancelUrl: string;
}

export interface NormalizedSubscription {
  providerSubscriptionId: string;
  providerCustomerId: string | null;
  providerPriceId: string | null;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  /** Our internal user id, recovered from whatever attribution mechanism the processor offers (Stripe metadata, MP external_reference). Null when unattributable — callers must not guess. */
  userId: string | null;
}

export interface WebhookVerifyInput {
  rawBody: string;
  headers: Headers;
  url: URL;
}

export type NormalizedWebhookEvent =
  | { kind: "subscription_event"; providerEventId: string; subscription: NormalizedSubscription }
  | { kind: "ignored"; providerEventId: string };
