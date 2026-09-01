import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { getActivePlans } from "@/lib/plans/queries";
import { getEntitlements } from "@/lib/auth/entitlements";
import { PricingPlans } from "@/components/billing/PricingPlans";
import { FAQ } from "@/components/marketing/FAQ";

export const metadata: Metadata = buildMetadata({
  title: "Precios",
  description: "Planes de Herramio: Gratis, Pro y Equipos. Elige el que se ajuste a tu forma de trabajar.",
  path: "/precios",
});

const PRICING_FAQ = [
  {
    question: "¿Qué incluye el plan gratuito?",
    answer:
      "Las herramientas, sin registro y sin límite de uso. El plan gratuito no es una demo: es el producto completo salvo Originalidad, que necesita cuenta porque guarda tus documentos para poder compararlos. Lo que aporta Pro es quitar los anuncios y ampliar los límites de análisis.",
  },
  {
    question: "¿Qué cuenta como un análisis de originalidad?",
    answer:
      "Cada documento que subes y se procesa. Volver a abrir un informe ya generado no consume nada, y un documento que falla al procesarse (por ejemplo un PDF escaneado sin texto) tampoco cuenta.",
  },
  {
    question: "¿Puedo cancelar cuando quiera?",
    answer:
      "Sí, desde tu cuenta y sin tener que escribir a nadie. Conservas el acceso hasta el final del periodo que ya pagaste; no se prorratea la parte no usada del mes en curso.",
  },
  {
    question: "¿Qué pasa con mis documentos si vuelvo al plan gratuito?",
    answer:
      "Siguen siendo tuyos y puedes consultarlos y eliminarlos. Lo que cambia es cuántos análisis nuevos puedes hacer al mes.",
  },
  {
    question: "¿Hay periodo de prueba?",
    answer:
      "No hay prueba de Pro con tarjeta. En su lugar, todo lo que se puede ofrecer sin coste ya está en el plan gratuito, para que decidas con el producto usado y no con una cuenta atrás.",
  },
];

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

      {/* The questions people actually have before paying, answered
          without hedging. A pricing page that only lists tiers leaves
          every one of them unanswered. */}
      <div className="mx-auto mt-16 max-w-2xl">
        <FAQ items={PRICING_FAQ} title="Preguntas sobre los planes" />
      </div>
    </div>
  );
}
