import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { SavingsGoalCalculator } from "@/components/tools/SavingsGoalCalculator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Calculadora de Ahorro Objetivo Online",
  description:
    "Calcula cuánto debes ahorrar cada mes para alcanzar una meta de ahorro, directamente en tu navegador.",
  path: "/finanzas-ahorro-objetivo",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Escribe tu meta de ahorro, lo que ya tienes ahorrado, en cuántos meses quieres lograrlo y, opcionalmente, el rendimiento anual que genera tu ahorro. La calculadora resuelve cuánto necesitas aportar cada mes para llegar exactamente a tu meta.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Saber cuánto ahorrar al mes para un viaje, un enganche o una compra grande",
      "Planificar un fondo de emergencia con una fecha límite clara",
      "Ver cómo un rendimiento anual (por ejemplo, de una cuenta de ahorro) reduce el aporte mensual necesario",
    ],
  },
];

const faqItems = [
  {
    question: "¿Esta calculadora es un consejo financiero?",
    answer: "No. Es una estimación matemática basada en los datos que ingresas, no una recomendación de inversión.",
  },
  {
    question: "¿Qué pasa si mi ahorro actual ya alcanza la meta?",
    answer: "La herramienta te lo indica directamente: si tu ahorro actual (con su rendimiento) ya cubre el objetivo en ese plazo, no necesitas aportar nada más.",
  },
  {
    question: "¿Se guardan mis datos en algún servidor?",
    answer: "No. El cálculo ocurre completamente en tu navegador.",
  },
];

export default function FinanzasAhorroObjetivoPage() {
  return (
    <ToolPageShell
      toolId="finanzas-ahorro-objetivo"
      toolName="Calculadora de Ahorro Objetivo"
      eyebrow="Calculadoras"
      intro="Calcula cuánto debes ahorrar cada mes para alcanzar una meta de ahorro."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <SavingsGoalCalculator />
    </ToolPageShell>
  );
}
