import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { TipCalculator } from "@/components/tools/TipCalculator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Calculadora de Propina Online",
  description:
    "Calcula la propina y el total a pagar en un restaurante, dividido entre las personas que quieras, gratis y sin registro.",
  path: "/finanzas-propina",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo se calcula la propina" },
  {
    type: "p",
    text: "La propina se calcula como un porcentaje de la cuenta total. Si además divides el pago entre varias personas, cada quien paga la misma parte proporcional de la cuenta más la propina.",
  },
  { type: "h2", text: "Qué muestra el resultado" },
  {
    type: "ul",
    items: [
      "Monto total de la propina",
      "Total a pagar (cuenta + propina)",
      "Cuánto le toca a cada persona, si divides entre varias",
    ],
  },
  { type: "h2", text: "Cuándo se usa" },
  {
    type: "ul",
    items: [
      "Calcular rápido cuánto dejar de propina en un restaurante",
      "Saber cuánto paga cada persona en una salida grupal",
      "Comparar cuánto cambia el total según el porcentaje de propina",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se guardan mis datos en algún servidor?",
    answer: "No. El cálculo ocurre completamente en tu navegador; los montos que escribes nunca se envían a ningún servidor.",
  },
  {
    question: "¿Puedo usar un porcentaje de propina distinto a 10%, 15% o 20%?",
    answer: "Sí, esos son solo atajos rápidos. Puedes escribir cualquier porcentaje en el campo de propina.",
  },
  {
    question: "¿Cómo se reparte la propina entre varias personas?",
    answer: "A partes iguales: el total (cuenta más propina) se divide entre el número de personas que indiques.",
  },
];

export default function FinanzasPropinaPage() {
  return (
    <ToolPageShell
      toolId="finanzas-propina"
      toolName="Calculadora de Propina"
      eyebrow="Calculadoras"
      intro="Calcula la propina y el total a pagar, dividido entre las personas que quieras."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <TipCalculator />
    </ToolPageShell>
  );
}
