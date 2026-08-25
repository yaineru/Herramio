import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Star, BarChart3, Lock } from "lucide-react";
import { CheckoutReturnTracker } from "@/components/billing/CheckoutReturnTracker";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getEntitlements } from "@/lib/auth/entitlements";
import { getPlanById } from "@/lib/plans/queries";
import { getPersonalSubscription } from "@/lib/subscriptions/queries";
import { FREE_PLAN_ID } from "@/lib/plans/types";
import { signOutAction } from "@/lib/auth/actions";
import { formatCurrencyFromCents } from "@/lib/plans/format";
import { getUsageSummaryForUser } from "@/lib/usage/queries";
import { getToolById } from "@/lib/tools/registry";

const PROVIDER_LABELS: Record<string, string> = {
  mercadopago: "Mercado Pago",
  stripe: "Stripe",
};

export const metadata: Metadata = buildMetadata({
  title: "Mi cuenta",
  description: "Gestiona tu cuenta, tu plan y tus preferencias en Herramio.",
  path: "/cuenta",
});

const STATUS_LABELS: Record<string, string> = {
  trialing: "En periodo de prueba",
  active: "Activa",
  past_due: "Pago pendiente",
  canceled: "Cancelada",
  incomplete: "Incompleta",
  unpaid: "Sin pagar",
};

export default async function CuentaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/iniciar-sesion?next=/cuenta");

  const [entitlements, subscription] = await Promise.all([getEntitlements(), getPersonalSubscription(user.id)]);
  const [plan, usage] = await Promise.all([
    getPlanById(entitlements.planId),
    entitlements.premiumTools ? getUsageSummaryForUser(user.id) : Promise.resolve([]),
  ]);
  const displayName = typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : null;

  return (
    <div className="container-page py-10">
      <Suspense fallback={null}>
        <CheckoutReturnTracker />
      </Suspense>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900">Mi cuenta</h1>

        <Card className="mt-6 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Perfil</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {displayName && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Nombre</dt>
                <dd className="font-medium text-slate-900">{displayName}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-slate-500">Correo</dt>
              <dd className="font-medium text-slate-900">{user.email}</dd>
            </div>
          </dl>
        </Card>

        <Card className="mt-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Plan actual</h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              {entitlements.planName}
            </span>
          </div>

          <div className="mt-3 space-y-2 text-sm">
            {plan &&
              (() => {
                const interval = subscription?.billingInterval ?? "month";
                const priceCents = interval === "year" ? plan.annualPriceCents : plan.monthlyPriceCents;
                return (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Precio</dt>
                    <dd className="font-medium text-slate-900">
                      {priceCents === null || priceCents === 0
                        ? "Gratis"
                        : `${formatCurrencyFromCents(priceCents, plan.currency)} / ${interval === "month" ? "mes" : "año"}`}
                    </dd>
                  </div>
                );
              })()}
            {subscription && (
              <>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Estado</dt>
                  <dd className="font-medium text-slate-900">{STATUS_LABELS[subscription.status] ?? subscription.status}</dd>
                </div>
                {subscription.currentPeriodEnd && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">{subscription.cancelAtPeriodEnd ? "Finaliza el" : "Próximo cobro"}</dt>
                    <dd className="font-medium text-slate-900">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString("es-CO", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-slate-500">Proveedor de pago</dt>
                  <dd className="font-medium text-slate-900">
                    {PROVIDER_LABELS[subscription.provider] ?? subscription.provider}
                  </dd>
                </div>
              </>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {entitlements.planId === FREE_PLAN_ID ? (
              <Link href="/precios">
                <Button size="sm">Pasar a Pro</Button>
              </Link>
            ) : (
              <Link href="/facturacion">
                <Button size="sm" variant="outline">
                  Gestionar suscripción
                </Button>
              </Link>
            )}
          </div>
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Herramientas</h2>
          <Link
            href="/favoritos"
            className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-emerald-600"
          >
            <Star className="h-4 w-4" />
            Ver mis favoritos y mi historial
          </Link>
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <BarChart3 className="h-4 w-4" />
            Uso de herramientas (últimos 30 días)
          </h2>
          {entitlements.premiumTools ? (
            usage.length > 0 ? (
              <ul className="mt-3 space-y-1.5 text-sm">
                {usage.slice(0, 8).map((u) => {
                  const tool = getToolById(u.toolId);
                  return (
                    <li key={u.toolId} className="flex justify-between">
                      <span className="text-slate-700">{tool?.name ?? u.toolId}</span>
                      <span className="font-medium text-slate-900">
                        {u.count} {u.count === 1 ? "uso" : "usos"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Todavía no hay uso registrado en los últimos 30 días.</p>
            )
          ) : (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <Lock className="h-4 w-4 shrink-0" />
              <span>
                Disponible en Pro y Equipo.{" "}
                <Link href="/precios" className="font-medium text-emerald-600 hover:underline">
                  Ver planes
                </Link>
                .
              </span>
            </div>
          )}
        </Card>

        <form action={signOutAction} className="mt-6">
          <Button type="submit" variant="ghost" size="sm">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
