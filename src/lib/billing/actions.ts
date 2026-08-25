"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getPlanById } from "@/lib/plans/queries";
import { getPersonalSubscription } from "@/lib/subscriptions/queries";
import { getBillingProvider } from "@/lib/billing/get-provider";
import { SITE } from "@/lib/site";
import type { BillingInterval, PlanId } from "@/lib/supabase/database.types";

/**
 * Starts a hosted checkout for a paid plan. Never activates Pro/Team here
 * — this only sends the user to the processor; the webhook route is what
 * actually writes the subscription row once payment is confirmed.
 *
 * `redirect()` is deliberately called outside any try/catch: Next.js
 * implements it by throwing, and catching that throw here would turn a
 * successful redirect into a false "payment error" — only the provider
 * call itself is wrapped.
 */
export async function createCheckoutSessionAction(planId: PlanId, interval: BillingInterval): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect(`/iniciar-sesion?next=/precios`);

  const plan = await getPlanById(planId);
  const providerPriceId = interval === "year" ? plan?.providerPriceIdAnnual : plan?.providerPriceIdMonthly;
  if (!plan || !providerPriceId) redirect("/precios?error=plan_no_disponible");

  const url = await startCheckout(providerPriceId, interval, planId, user.id, user.email ?? null);
  if (!url) redirect("/precios?error=pagos_no_configurados");
  redirect(url);
}

async function startCheckout(
  providerPriceId: string,
  interval: BillingInterval,
  planId: PlanId,
  userId: string,
  customerEmail: string | null,
): Promise<string | null> {
  try {
    const { url } = await getBillingProvider().createCheckoutSession({
      providerPriceId,
      interval,
      planId,
      userId,
      customerEmail,
      successUrl: `${SITE.url}/cuenta?checkout=exito`,
      cancelUrl: `${SITE.url}/precios?checkout=cancelado`,
    });
    return url;
  } catch (error) {
    console.error("No se pudo iniciar el checkout:", error);
    return null;
  }
}

/**
 * Sends an existing paying customer to a processor-hosted billing portal
 * when one exists (Stripe); when it doesn't (Mercado Pago), redirects back
 * with `error=portal_no_disponible` so the /facturacion page can offer
 * `cancelSubscriptionAction` instead.
 */
export async function createBillingPortalSessionAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/iniciar-sesion?next=/facturacion");

  const subscription = await getPersonalSubscription(user.id);
  if (!subscription?.providerCustomerId) redirect("/facturacion?error=sin_suscripcion");

  const url = await startPortalSession(subscription.providerCustomerId);
  if (!url) redirect("/facturacion?error=portal_no_disponible");
  redirect(url);
}

async function startPortalSession(providerCustomerId: string): Promise<string | null> {
  try {
    const session = await getBillingProvider().createCustomerPortalSession({
      providerCustomerId,
      returnUrl: `${SITE.url}/cuenta`,
    });
    return session?.url ?? null;
  } catch (error) {
    console.error("No se pudo abrir el portal de facturación:", error);
    return null;
  }
}

/** Direct cancellation via the processor's API — the only option for processors without a hosted portal, and always available regardless of processor. */
export async function cancelSubscriptionAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/iniciar-sesion?next=/facturacion");

  const subscription = await getPersonalSubscription(user.id);
  if (!subscription?.providerSubscriptionId) redirect("/facturacion?error=sin_suscripcion");

  const ok = await requestCancellation(subscription.providerSubscriptionId);
  redirect(ok ? "/facturacion?cancelado=solicitado" : "/facturacion?error=error_cancelacion");
}

async function requestCancellation(providerSubscriptionId: string): Promise<boolean> {
  try {
    // Deliberately not writing to `subscriptions` here — the processor's
    // own webhook confirms the cancellation and syncs the real state,
    // same rule as every other subscription change.
    await getBillingProvider().cancelSubscription(providerSubscriptionId);
    return true;
  } catch (error) {
    console.error("No se pudo cancelar la suscripción:", error);
    return false;
  }
}
