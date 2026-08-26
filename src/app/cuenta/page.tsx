import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Star, BarChart3, Lock, Sparkles, Clock3, ArrowUpRight } from "lucide-react";
import { CheckoutReturnTracker } from "@/components/billing/CheckoutReturnTracker";
import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";
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
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">Workspace</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-slate-900 sm:text-4xl">Mi cuenta</h1>
          </div>
          <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-[0_8px_18px_rgba(16,185,129,0.08)]">
            {entitlements.planName}
          </span>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="surface-glow p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Plan</p>
              <Sparkles className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-3 text-xl font-bold tracking-[-0.04em] text-slate-900">{entitlements.planName}</p>
            <p className="mt-1 text-sm text-slate-500">Acceso y límites activos</p>
          </div>

          <div className="surface-glow p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Uso</p>
              <Clock3 className="h-4 w-4 text-slate-600" />
            </div>
            <p className="mt-3 text-xl font-bold tracking-[-0.04em] text-slate-900">{usage.length}</p>
            <p className="mt-1 text-sm text-slate-500">Herramientas utilizadas</p>
          </div>

          <div className="surface-glow p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Acceso rápido</p>
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-3 text-xl font-bold tracking-[-0.04em] text-slate-900">2</p>
            <p className="mt-1 text-sm text-slate-500">Acciones relevantes hoy</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card className="surface-glow p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Perfil</h2>
              <dl className="mt-4 space-y-3 text-sm">
                {displayName && (
                  <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                    <dt className="text-slate-500">Nombre</dt>
                    <dd className="font-medium text-slate-900">{displayName}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Correo</dt>
                  <dd className="font-medium text-slate-900">{user.email}</dd>
                </div>
              </dl>
            </Card>

            <Card className="surface-glow p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Plan actual</h2>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                {plan &&
                  (() => {
                    const interval = subscription?.billingInterval ?? "month";
                    const priceCents = interval === "year" ? plan.annualPriceCents : plan.monthlyPriceCents;
                    return (
                      <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
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
                    <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                      <dt className="text-slate-500">Estado</dt>
                      <dd className="font-medium text-slate-900">{STATUS_LABELS[subscription.status] ?? subscription.status}</dd>
                    </div>
                    {subscription.currentPeriodEnd && (
                      <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
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
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Proveedor</dt>
                      <dd className="font-medium text-slate-900">
                        {PROVIDER_LABELS[subscription.provider] ?? subscription.provider}
                      </dd>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
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
          </div>

          <div className="space-y-6">
            <Card className="surface-glow p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                <Star className="h-4 w-4" />
                Herramientas
              </h2>
              <div className="mt-4 space-y-2">
                <Link
                  href="/favoritos"
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  <Star className="h-4 w-4" />
                  Ver favoritos y historial
                </Link>
                <Link
                  href="/herramientas"
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Explorar más herramientas
                </Link>
              </div>
            </Card>

            <Card className="surface-glow p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                <BarChart3 className="h-4 w-4" />
                Uso de herramientas
              </h2>
              {entitlements.premiumTools ? (
                usage.length > 0 ? (
                  <ul className="mt-4 space-y-2 text-sm">
                    {usage.slice(0, 8).map((u) => {
                      const tool = getToolById(u.toolId);
                      return (
                        <li key={u.toolId} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                          <span className="text-slate-700">{tool?.name ?? u.toolId}</span>
                          <span className="font-medium text-slate-900">
                            {u.count} {u.count === 1 ? "uso" : "usos"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">Todavía no hay uso registrado en los últimos 30 días.</p>
                )
              ) : (
                <div className="mt-4 flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <span>
                    Disponible en Pro y Equipo. <Link href="/precios" className="font-medium text-emerald-700 hover:underline">Ver planes</Link>.
                  </span>
                </div>
              )}
            </Card>
          </div>
        </div>

        <form action={signOutAction} className="mt-8">
          <Button type="submit" variant="ghost" size="sm">
            Cerrar sesión
          </Button>
        </form>
      </div>

      {/* Beta channel. Lives on the workspace because this is where
          someone lands after using the product, which is when they
          actually have something to say. */}
      <FeedbackWidget />
    </div>
  );
}
