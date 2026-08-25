import "server-only";
import { MercadoPagoConfig } from "mercadopago";

let cached: MercadoPagoConfig | null = null;

/**
 * Lazily-constructed Mercado Pago config — never at module load time, so
 * pages that don't touch billing still build/run fine before
 * MERCADOPAGO_ACCESS_TOKEN is configured. Only checkout/webhook/cancel
 * code paths call this, and they fail with a clear message (not a fake
 * success) if the token is missing.
 */
export function getMercadoPagoConfig(): MercadoPagoConfig {
  if (cached) return cached;

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "Los pagos todavía no están configurados (falta MERCADOPAGO_ACCESS_TOKEN). " +
        "Esta función estará disponible en cuanto se configure el proveedor de pagos.",
    );
  }

  cached = new MercadoPagoConfig({ accessToken });
  return cached;
}
