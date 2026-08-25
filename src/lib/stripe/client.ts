import "server-only";
import Stripe from "stripe";

let cached: Stripe | null = null;

/**
 * Lazily-constructed Stripe client — never at module load time, so pages
 * that don't touch billing still build/run fine before STRIPE_SECRET_KEY is
 * configured. Only checkout/webhook/portal code paths call this, and they
 * fail with a clear message (not a fake success) if the key is missing.
 */
export function getStripeClient(): Stripe {
  if (cached) return cached;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "Los pagos todavía no están configurados (falta STRIPE_SECRET_KEY). " +
        "Esta función estará disponible en cuanto se configure el proveedor de pagos.",
    );
  }

  cached = new Stripe(secretKey);
  return cached;
}
