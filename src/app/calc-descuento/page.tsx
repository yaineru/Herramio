import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { DiscountCalculator } from "@/components/tools/DiscountCalculator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Calculadora de Descuento Online",
  description:
    "Calcula cuánto ahorras y el precio final con cualquier porcentaje de descuento. Gratis, sin registro, resultado instantáneo.",
  path: "/calc-descuento",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo se calcula un descuento" },
  {
    type: "p",
    text: "El ahorro es el precio original multiplicado por el porcentaje de descuento, dividido entre 100. El precio final es el precio original menos ese ahorro. Por ejemplo, un producto de $100 con 20% de descuento: ahorras $20 y pagas $80.",
  },
  { type: "h2", text: "Casos de uso" },
  {
    type: "ul",
    items: [
      "Calcular el precio real en una rebaja o temporada de descuentos",
      "Comparar ofertas de distintas tiendas rápidamente",
      "Calcular descuentos por volumen o por cliente frecuente",
    ],
  },
];

const faqItems = [
  {
    question: "¿Puedo calcular descuentos mayores al 100%?",
    answer: "Matemáticamente sí se puede ingresar, pero un descuento superior al 100% no tiene sentido comercial — el precio final nunca debería ser negativo en un caso real.",
  },
  {
    question: "¿Esta calculadora aplica varios descuentos acumulados?",
    answer: "No automáticamente. Para descuentos acumulados (ej. 20% + 10% adicional), calcula el primer descuento, usa ese resultado como precio original, y aplica el segundo descuento por separado.",
  },
];

export default function CalcDescuentoPage() {
  return (
    <ToolPageShell
      toolId="calc-descuento"
      toolName="Calculadora de Descuento"
      eyebrow="Calculadoras"
      intro="Calcula cuánto ahorras y el precio final con cualquier porcentaje de descuento, al instante."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <DiscountCalculator />
    </ToolPageShell>
  );
}
