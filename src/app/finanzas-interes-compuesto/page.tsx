import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { CompoundInterestCalculator } from "@/components/tools/CompoundInterestCalculator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Calculadora de Interés Compuesto Online",
  description:
    "Calcula cuánto crece tu dinero con interés compuesto y aportes mensuales, con desglose año a año, directamente en tu navegador.",
  path: "/finanzas-interes-compuesto",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "El interés compuesto se calcula sobre el capital inicial más los intereses ya generados en periodos anteriores, por eso el crecimiento se acelera con el tiempo. Esta calculadora permite además sumar un aporte mensual fijo, y muestra el desglose año a año.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Estimar cuánto puede crecer una inversión o ahorro a largo plazo",
      "Comparar el efecto de distintas tasas de interés o frecuencias de capitalización",
      "Ver cuánto suman los aportes mensuales frente al interés generado",
    ],
  },
];

const faqItems = [
  {
    question: "¿Esta calculadora es un consejo financiero?",
    answer: "No. Es una estimación matemática basada en los datos que ingresas, no una recomendación de inversión.",
  },
  {
    question: "¿Qué significa la frecuencia de capitalización?",
    answer: "Es cuántas veces al año se calculan y se suman los intereses al capital. Una capitalización más frecuente (por ejemplo, mensual en vez de anual) genera un poco más de interés total con la misma tasa anual.",
  },
  {
    question: "¿Se guardan mis datos en algún servidor?",
    answer: "No. El cálculo ocurre completamente en tu navegador.",
  },
];

export default function FinanzasInteresCompuestoPage() {
  return (
    <ToolPageShell
      toolId="finanzas-interes-compuesto"
      toolName="Calculadora de Interés Compuesto"
      eyebrow="Calculadoras"
      intro="Calcula cuánto crece tu dinero con interés compuesto y aportes mensuales, año a año."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <CompoundInterestCalculator />
    </ToolPageShell>
  );
}
