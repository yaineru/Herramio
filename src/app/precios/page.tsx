import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { getActivePlans } from "@/lib/plans/queries";
import { getEntitlements } from "@/lib/auth/entitlements";
import { PricingPlans } from "@/components/billing/PricingPlans";

export const metadata: Metadata = buildMetadata({
  title: "Precios",
  description: "Planes de Herramio: Gratis, Pro y Equipos. Elige el que se ajuste a tu forma de trabajar.",
  path: "/precios",
});

export default async function PreciosPage() {
  const [plans, entitlements] = await Promise.all([getActivePlans(), getEntitlements()]);

  return (
    <div className="container-page py-10">
      <Breadcrumbs items={[{ href: "/precios", label: "Precios" }]} />
      <div className="mx-auto mt-6 max-w-4xl text-center">
        <h1 className="text-4xl font-bold text-slate-900">Un plan para cada forma de trabajar</h1>
        <p className="mt-3 text-slate-500">Empieza gratis. Pasa a Pro o Equipos cuando lo necesites.</p>
      </div>

      <PricingPlans plans={plans} currentPlanId={entitlements.planId} />
    </div>
  );
}
