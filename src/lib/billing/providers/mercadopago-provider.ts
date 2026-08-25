import "server-only";
import { PreApproval, WebhookSignatureValidator } from "mercadopago";
import { getMercadoPagoConfig } from "@/lib/mercadopago/client";
import { mapMercadoPagoSubscriptionStatus } from "@/lib/mercadopago/status-map";
import type {
  BillingProvider,
  CreateCheckoutInput,
  NormalizedSubscription,
  NormalizedWebhookEvent,
  WebhookVerifyInput,
} from "@/lib/billing/provider";

/**
 * The subset of PreApproval response fields this file actually reads,
 * declared locally rather than imported from the SDK: the SDK's own
 * exported `PreApprovalResponse` type (only reachable via a deep import,
 * not the package root) omits `preapproval_plan_id` even though the API
 * returns it — see the comment in `toNormalizedSubscription` below.
 */
interface PreApprovalResource {
  id?: string;
  status?: string;
  external_reference?: string;
  next_payment_date?: string;
  init_point?: string;
  preapproval_plan_id?: string;
}

function toNormalizedSubscription(sub: PreApprovalResource): NormalizedSubscription {
  return {
    providerSubscriptionId: sub.id ?? "",
    // Mercado Pago identifies the payer by their own numeric MP account id,
    // not a portable "customer" concept the way Stripe has one — there is
    // nothing meaningful to store as a provider customer id here.
    providerCustomerId: null,
    // Confirm `preapproval_plan_id` is actually present on a real sandbox
    // response before relying on this in production — see MONETIZATION.md.
    providerPriceId: sub.preapproval_plan_id ?? null,
    status: mapMercadoPagoSubscriptionStatus(sub.status),
    currentPeriodEnd: sub.next_payment_date ?? null,
    cancelAtPeriodEnd: sub.status === "cancelled",
    userId: sub.external_reference ?? null,
  };
}

export const mercadoPagoProvider: BillingProvider = {
  name: "mercadopago",

  async createCheckoutSession(input: CreateCheckoutInput) {
    const client = new PreApproval(getMercadoPagoConfig());
    const response = await client.create({
      body: {
        preapproval_plan_id: input.providerPriceId,
        payer_email: input.customerEmail ?? undefined,
        external_reference: input.userId,
        back_url: input.successUrl,
      },
    });
    // Mercado Pago's Checkout Pro (Preference) API exposes a separate
    // `sandbox_init_point` for test credentials; PreApproval's documented
    // response type doesn't list one, but this needs confirming against a
    // real sandbox account before relying on it — see MONETIZATION.md.
    if (!response.init_point) throw new Error("Mercado Pago no devolvió una URL de autorización (init_point).");
    return { url: response.init_point };
  },

  async createCustomerPortalSession() {
    // Mercado Pago has no hosted self-service billing portal equivalent to
    // Stripe's — callers must fall back to cancelSubscription directly.
    return null;
  },

  async cancelSubscription(providerSubscriptionId: string) {
    const client = new PreApproval(getMercadoPagoConfig());
    await client.update({ id: providerSubscriptionId, body: { status: "cancelled" } });
  },

  async verifyAndParseWebhook({ rawBody, headers, url }: WebhookVerifyInput): Promise<NormalizedWebhookEvent> {
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (!secret) throw new Error("MERCADOPAGO_WEBHOOK_SECRET no configurado.");

    const dataId = url.searchParams.get("data.id");
    const type = url.searchParams.get("type");

    // Throws InvalidWebhookSignatureError on any mismatch — the route
    // handler catches that the same way it would a Stripe signature
    // failure, never treating an unverified request as real.
    WebhookSignatureValidator.validate({
      xSignature: headers.get("x-signature"),
      xRequestId: headers.get("x-request-id"),
      dataId,
      secret,
      toleranceSeconds: 300,
    });

    // Mercado Pago's own guidance: don't trust the notification body for
    // subscription state, always re-fetch the authoritative resource by
    // id. `rawBody` is only used for the id fallback below, never for
    // status.
    const parsedBody = rawBody ? (JSON.parse(rawBody) as { data?: { id?: string } }) : {};
    const resourceId = dataId ?? parsedBody.data?.id;
    const providerEventId = `${resourceId ?? "unknown"}:${headers.get("x-request-id") ?? ""}`;

    if (type !== "subscription_preapproval" || !resourceId) {
      return { kind: "ignored", providerEventId };
    }

    const client = new PreApproval(getMercadoPagoConfig());
    const subscription = await client.get({ id: resourceId });

    return { kind: "subscription_event", providerEventId, subscription: toNormalizedSubscription(subscription) };
  },
};
