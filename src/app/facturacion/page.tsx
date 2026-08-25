import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getPersonalSubscription } from "@/lib/subscriptions/queries";
import { getPlanById } from "@/lib/plans/queries";
import { createBillingPortalSessionAction, cancelSubscriptionAction } from "@/lib/billing/actions";

export const metadata: Metadata = buildMetadata({
  title: "Facturación",
  description: "Gestiona tu suscripción y método de pago en Herramio.",
  path: "/facturacion",
});

export default async function FacturacionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/iniciar-sesion?next=/facturacion");

  const subscription = await getPersonalSubscription(user.id);
  const plan = subscription ? await getPlanById(subscription.planId) : null;

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-lg">
        <h1 className="text-3xl font-bold text-slate-900">Facturación</h1>

        <Card className="mt-6 p-6">
          {subscription?.providerSubscriptionId && subscription.status !== "canceled" ? (
            <>
              <p className="text-sm text-slate-600">
                Plan actual: <span className="font-medium text-slate-900">{plan?.name ?? subscription.planId}</span>
              </p>
              {subscription.providerCustomerId ? (
                <>
                  <p className="mt-1 text-sm text-slate-500">
                    Actualiza tu método de pago, descarga facturas o cancela tu suscripción en el portal seguro de
                    pagos.
                  </p>
                  <form action={createBillingPortalSessionAction} className="mt-4">
                    <Button type="submit" size="sm">
                      Ir al portal de facturación
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <p className="mt-1 text-sm text-slate-500">
                    Puedes cancelar tu suscripción en cualquier momento — seguirá activa hasta el final del periodo
                    ya pagado.
                  </p>
                  <form action={cancelSubscriptionAction} className="mt-4">
                    <Button type="submit" size="sm" variant="outline">
                      Cancelar suscripción
                    </Button>
                  </form>
                </>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600">Todavía no tienes una suscripción de pago activa.</p>
              <Link href="/precios" className="mt-4 inline-block">
                <Button size="sm">Ver planes</Button>
              </Link>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
