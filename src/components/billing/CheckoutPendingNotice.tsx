"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock3 } from "lucide-react";

/**
 * What someone sees in the gap between paying and the webhook landing.
 *
 * Returning from Mercado Pago proves only that a browser came back. The
 * subscription is written by the webhook, which arrives seconds later
 * through a completely different channel, so for a moment a user who has
 * genuinely just paid sees "Gratis" on their account page with no
 * explanation. That is the moment they email support, or worse, pay
 * again.
 *
 * So this says the honest thing — that the payment is being confirmed —
 * and NEVER that the plan is active. It renders only while the account is
 * still on the free plan: the instant the server sees a paid plan, the
 * real plan badge is the only thing on screen.
 *
 * The refresh is bounded on purpose. If the webhook has not arrived in
 * about a minute something is actually wrong, and quietly polling forever
 * would hide that instead of surfacing it.
 */

const ATTEMPTS = 6;
const INTERVAL_MS = 10_000;

export function CheckoutPendingNotice({ isPaid }: { isPaid: boolean }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const justReturned = searchParams.get("checkout") === "exito";
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!justReturned || isPaid || attempt >= ATTEMPTS) return;
    const timer = setTimeout(() => {
      setAttempt((n) => n + 1);
      // Re-runs the Server Component, which re-reads the subscription.
      // The client never decides its own plan.
      router.refresh();
    }, INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [justReturned, isPaid, attempt, router]);

  if (!justReturned || isPaid) return null;

  const gaveUp = attempt >= ATTEMPTS;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-6 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3.5"
    >
      <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" aria-hidden="true" />
      <div className="text-sm text-sky-900">
        {gaveUp ? (
          <>
            <p className="font-semibold">Tu suscripción todavía no aparece confirmada.</p>
            <p className="mt-1">
              Si ya completaste el pago, no vuelvas a pagar. Puede tardar unos minutos más; si sigue igual,
              escríbenos con el botón de comentarios y lo revisamos.
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold">Estamos verificando tu suscripción.</p>
            <p className="mt-1">
              El pago lo confirma Mercado Pago, no este navegador, así que puede tardar unos segundos. Esta página se
              actualiza sola.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
