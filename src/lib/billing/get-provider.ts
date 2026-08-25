import "server-only";
import type { BillingProvider } from "@/lib/billing/provider";
import { mercadoPagoProvider } from "@/lib/billing/providers/mercadopago-provider";
import { stripeProvider } from "@/lib/billing/providers/stripe-provider";

/**
 * The only place that knows which processor is active. Everything else —
 * Server Actions, pages — calls `getBillingProvider()` and talks to the
 * returned `BillingProvider`, never to Stripe or Mercado Pago directly.
 * Switching processors (or adding a third) is a change here, not a
 * refactor of the checkout/cancel/webhook call sites.
 */
export function getBillingProvider(): BillingProvider {
  const configured = process.env.BILLING_PROVIDER;
  if (configured === "stripe") return stripeProvider;
  // Mercado Pago is the default: it's the recommended primary for a
  // Colombia-based merchant (native CO accounts, real subscriptions API,
  // no foreign incorporation) — see MONETIZATION.md for the researched
  // comparison. Stripe stays fully implemented behind the same interface
  // for a future international-expansion phase.
  return mercadoPagoProvider;
}
