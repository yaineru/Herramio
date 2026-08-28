import "server-only";
import { PreApproval, PreApprovalPlan, WebhookSignatureValidator } from "mercadopago";
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

/**
 * Herramio user ids are Supabase auth UUIDs. Anything else in
 * `external_reference` is not one.
 *
 * This matters because the field is not exclusively ours: a plan template
 * carries its own external_reference (HERRAMIO_PRO_MONTHLY), and if a
 * subscription ever inherits the plan's value instead of the one attached
 * at checkout, an unguarded read would hand that string on as a user id.
 * Nothing downstream would match it, but the failure would be silent and
 * confusing. Requiring a UUID turns it into a logged "no attributable
 * user", which grants nothing and says why.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    userId: sub.external_reference && UUID.test(sub.external_reference) ? sub.external_reference : null,
  };
}

/**
 * Resolves a recurring-charge invoice to the subscription it belongs to.
 *
 * Written against the HTTP API rather than the SDK because the Node SDK
 * has no client for `/authorized_payments` — the exported clients are
 * PreApproval and PreApprovalPlan, with nothing for invoices.
 *
 * Returns null rather than throwing on anything unexpected: a renewal
 * notification we cannot resolve must degrade to "ignored", never take
 * down the webhook endpoint and provoke Mercado Pago into retrying a
 * request that will fail identically every time.
 */
async function resolveSubscriptionFromInvoice(invoiceId: string): Promise<string | null> {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) return null;

  try {
    const response = await fetch(`https://api.mercadopago.com/authorized_payments/${invoiceId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      console.error(`[mercadopago] No se pudo leer la cuota ${invoiceId}: HTTP ${response.status}`);
      return null;
    }
    const invoice = (await response.json()) as { preapproval_id?: string };
    return invoice.preapproval_id ?? null;
  } catch (error) {
    console.error(`[mercadopago] Error consultando la cuota ${invoiceId}:`, error);
    return null;
  }
}

export const mercadoPagoProvider: BillingProvider = {
  name: "mercadopago",

  async createCheckoutSession(input: CreateCheckoutInput) {
    /*
     * Redirect to the PLAN's hosted checkout. A subscription cannot be
     * created from the server.
     *
     * This used to POST /preapproval with a payer_email, which fails —
     * measured against the live API, every variant returns
     * `400 card_token_id is required`. That is not a missing field we
     * could supply: the card token is produced in the browser by MP.js
     * from card details this server must never see. So the only route to
     * a subscription is Mercado Pago's own hosted page, which the plan
     * exposes as `init_point`.
     *
     * The old code would have returned 400 for every single checkout
     * attempt, and the action's catch would have shown users
     * "pagos_no_configurados" forever.
     *
     * `sandbox_init_point` does not exist on a preapproval_plan (checked
     * against a real response). On test credentials `init_point` IS the
     * test checkout.
     */
    const plans = new PreApprovalPlan(getMercadoPagoConfig());
    const plan = await plans.get({ preApprovalPlanId: input.providerPriceId });

    const initPoint = (plan as { init_point?: string }).init_point;
    if (!initPoint) throw new Error("Mercado Pago no devolvió una URL de suscripción (init_point) para el plan.");

    // Attribution. The webhook re-reads the subscription and maps it to a
    // person by external_reference, so the user id has to travel with the
    // redirect — the plan's own external_reference identifies the PLAN,
    // not the buyer. If Mercado Pago ever fails to carry this through,
    // toNormalizedSubscription's UUID check turns that into a logged
    // "no attributable user" rather than a subscription granted to nobody.
    const url = new URL(initPoint);
    url.searchParams.set("external_reference", input.userId);
    return { url: url.toString() };
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

    if (!resourceId) return { kind: "ignored", providerEventId };

    /*
     * Two topics reach the same place, deliberately.
     *
     * `subscription_preapproval` carries the subscription itself.
     * `subscription_authorized_payment` carries an INVOICE — one recurring
     * charge — whose id is not a subscription id, so it has to be resolved
     * to the subscription it belongs to before anything can be done with
     * it.
     *
     * What this handler pointedly does NOT do is derive subscription state
     * from a payment. Mercado Pago retries a failed charge (status
     * `recycling`) for up to 10 days and only then cancels the
     * subscription itself — and that cancellation arrives as a
     * `subscription_preapproval` event. So the preapproval stays the one
     * source of truth for whether someone has access, and a renewal event
     * is simply a reason to re-read it. Marking a user past_due because
     * one charge is recycling would be inventing a state the provider is
     * not reporting, and would cut off access Mercado Pago still considers
     * paid for.
     */
    let preapprovalId: string | null = null;

    if (type === "subscription_preapproval") {
      preapprovalId = resourceId;
    } else if (type === "subscription_authorized_payment") {
      preapprovalId = await resolveSubscriptionFromInvoice(resourceId);
      if (!preapprovalId) return { kind: "ignored", providerEventId };
    } else {
      // subscription_preapproval_plan, payment, and anything else: recorded
      // by the route for traceability, acted on by nobody.
      return { kind: "ignored", providerEventId };
    }

    const client = new PreApproval(getMercadoPagoConfig());
    const subscription = await client.get({ id: preapprovalId });

    return { kind: "subscription_event", providerEventId, subscription: toNormalizedSubscription(subscription) };
  },
};
