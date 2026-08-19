import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PercentageCalculator } from "@/components/tools/PercentageCalculator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Calculadora de Porcentaje Online",
  description:
    "Calcula porcentajes gratis: qué es X% de Y, qué porcentaje representa un número, o aumenta/disminuye una cantidad en un porcentaje. Sin registro.",
  path: "/calc-porcentaje",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo usar la calculadora de porcentaje" },
  {
    type: "p",
    text: "Elige el tipo de cálculo que necesitas arriba, escribe los dos valores y el resultado aparece al instante, sin presionar ningún botón de calcular.",
  },
  { type: "h2", text: "Los 4 cálculos que soporta" },
  {
    type: "ul",
    items: [
      "X% de Y — ejemplo: 20% de 500 = 100",
      "X es qué porcentaje de Y — ejemplo: 50 de 200 = 25%",
      "Aumentar una cantidad en X% — ejemplo: 500 + 20% = 600",
      "Disminuir una cantidad en X% — ejemplo: 500 − 20% = 400",
    ],
  },
  { type: "h2", text: "Ejemplos de uso real" },
  {
    type: "ul",
    items: [
      "Calcular una propina o comisión sobre una cuenta",
      "Saber cuánto ahorras con un descuento del 30%",
      "Calcular un aumento de sueldo o precio",
      "Saber qué porcentaje de tus ingresos representa un gasto",
    ],
  },
];

const faqItems = [
  {
    question: "¿Cómo se saca un porcentaje de una cantidad?",
    answer:
      "Se multiplica la cantidad por el porcentaje y se divide entre 100. Por ejemplo, 20% de 500 es (20 × 500) ÷ 100 = 100. La calculadora hace esta operación automáticamente en el modo \"X% de Y\".",
  },
  {
    question: "¿Cómo calculo qué porcentaje es un número de otro?",
    answer:
      "Se divide la parte entre el total y se multiplica por 100. Por ejemplo, 50 de 200 es (50 ÷ 200) × 100 = 25%. Usa el modo \"X es qué % de Y\".",
  },
  {
    question: "¿Puedo usar números decimales?",
    answer: "Sí, la calculadora admite decimales en ambos campos, con hasta 4 cifras de precisión en el resultado.",
  },
  {
    question: "¿Los datos que escribo se guardan en algún lugar?",
    answer: "No. El cálculo ocurre completamente en tu navegador; no enviamos ni almacenamos ningún dato.",
  },
];

export default function CalcPorcentajePage() {
  return (
    <ToolPageShell
      toolId="calc-porcentaje"
      toolName="Calculadora de Porcentaje Online"
      eyebrow="Calculadoras"
      intro="Calcula porcentajes al instante: qué es X% de Y, qué porcentaje representa un número, o aumenta/disminuye una cantidad."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PercentageCalculator />
    </ToolPageShell>
  );
}
