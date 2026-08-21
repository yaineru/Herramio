import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { LoanCalculator } from "@/components/tools/LoanCalculator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Calculadora de Préstamo y Cuotas Online",
  description:
    "Calcula la cuota mensual de un préstamo y su tabla de amortización completa, directamente en tu navegador.",
  path: "/finanzas-prestamo",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Escribe el monto del préstamo, la tasa de interés anual y el plazo en meses. La calculadora usa la fórmula estándar de amortización de cuota fija y muestra, mes a mes, cuánto de cada pago va a capital y cuánto a interés.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Estimar la cuota mensual de un préstamo personal, de auto o hipotecario",
      "Comparar el costo total (capital + interés) entre distintos plazos o tasas",
      "Ver exactamente cuánto interés pagas cada mes de la tabla de amortización",
    ],
  },
];

const faqItems = [
  {
    question: "¿Esta calculadora es un consejo financiero?",
    answer: "No. Es una estimación matemática basada en los datos que ingresas, no una recomendación de crédito.",
  },
  {
    question: "¿Qué es la tabla de amortización?",
    answer: "Es el desglose mes a mes de cada cuota: cuánto se destina a pagar el capital prestado y cuánto a intereses, y cómo va bajando el saldo pendiente.",
  },
  {
    question: "¿Se guardan mis datos en algún servidor?",
    answer: "No. El cálculo ocurre completamente en tu navegador.",
  },
];

export default function FinanzasPrestamoPage() {
  return (
    <ToolPageShell
      toolId="finanzas-prestamo"
      toolName="Calculadora de Préstamo y Cuotas"
      eyebrow="Calculadoras"
      intro="Calcula la cuota mensual de un préstamo y su tabla de amortización completa."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <LoanCalculator />
    </ToolPageShell>
  );
}
