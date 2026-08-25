import "server-only";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";
import { mapStripeSubscriptionStatus } from "@/lib/stripe/status-map";
import type {
  BillingProvider,
  CreateCheckoutInput,
  NormalizedSubscription,
  NormalizedWebhookEvent,
  WebhookVerifyInput,
} from "@/lib/billing/provider";

function toNormalizedSubscription(sub: Stripe.Subscription): NormalizedSubscription {
  const item = sub.items.data[0];
  return {
    providerSubscriptionId: sub.id,
    providerCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    providerPriceId: item?.price?.id ?? null,
    status: mapStripeSubscriptionStatus(sub.status),
    currentPeriodEnd: item?.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    userId: sub.metadata?.user_id ?? null,
  };
}

export const stripeProvider: BillingProvider = {
  name: "stripe",

  async createCheckoutSession(input: CreateCheckoutInput) {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: input.providerPriceId, quantity: 1 }],
      client_reference_id: input.userId,
      customer_email: input.customerEmail ?? undefined,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: { user_id: input.userId, plan_id: input.planId },
      subscription_data: { metadata: { user_id: input.userId, plan_id: input.planId } },
    });
    if (!session.url) throw new Error("Stripe no devolvió una URL de checkout.");
    return { url: session.url };
  },

  async createCustomerPortalSession({ providerCustomerId, returnUrl }) {
    const stripe = getStripeClient();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: providerCustomerId,
      return_url: returnUrl,
    });
    return { url: portalSession.url };
  },

  async cancelSubscription(providerSubscriptionId: string) {
    const stripe = getStripeClient();
    await stripe.subscriptions.cancel(providerSubscriptionId);
  },

  async verifyAndParseWebhook({ rawBody, headers }: WebhookVerifyInput): Promise<NormalizedWebhookEvent> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET no configurado.");

    const signature = headers.get("stripe-signature");
    if (!signature) throw new Error("Falta el header stripe-signature.");

    const event = getStripeClient().webhooks.constructEvent(rawBody, signature, webhookSecret);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        // Re-fetch rather than trust `event.data.object`: Stripe does not
        // guarantee webhook delivery order, so a delayed/retried older
        // event could otherwise overwrite a newer state. Asking Stripe for
        // the subscription's current truth means every delivery — in any
        // order, even duplicates — converges on the same correct result.
        // A canceled subscription is still retrievable (status: canceled),
        // so this works uniformly for all three event types.
        const current = await getStripeClient().subscriptions.retrieve(event.data.object.id);
        return { kind: "subscription_event", providerEventId: event.id, subscription: toNormalizedSubscription(current) };
      }
      default:
        return { kind: "ignored", providerEventId: event.id };
    }
  },
};
