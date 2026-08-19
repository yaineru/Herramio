import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { RuleOfThreeCalculator } from "@/components/tools/RuleOfThreeCalculator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Calculadora de Regla de Tres Online",
  description:
    "Resuelve reglas de tres directas e inversas gratis: A es a B como C es a X. Ideal para tareas escolares, recetas y conversiones proporcionales.",
  path: "/calc-regla-de-tres",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Regla de tres directa vs. inversa" },
  {
    type: "p",
    text: "En una regla de tres directa, cuando una cantidad aumenta, la otra también aumenta en la misma proporción (ej. más ingredientes para más porciones de una receta): X = (B × C) ÷ A. En una regla de tres inversa, cuando una cantidad aumenta, la otra disminuye (ej. más trabajadores, menos días para terminar una obra): X = (A × B) ÷ C.",
  },
  { type: "h2", text: "Ejemplo de proporción directa" },
  {
    type: "p",
    text: "Si 5 kg de harina cuestan $10, ¿cuánto cuestan 8 kg? A=5, B=10, C=8 → X = (10 × 8) ÷ 5 = $16.",
  },
  { type: "h2", text: "Ejemplo de proporción inversa" },
  {
    type: "p",
    text: "Si 4 obreros terminan una obra en 6 días, ¿cuántos días tardarían 8 obreros? A=4, B=6, C=8 → X = (4 × 6) ÷ 8 = 3 días.",
  },
];

const faqItems = [
  {
    question: "¿Cómo sé si debo usar la regla directa o la inversa?",
    answer:
      "Pregúntate: si la tercera cantidad (C) aumenta, ¿la respuesta (X) también debería aumentar? Si sí, es directa. Si la respuesta debería disminuir, es inversa.",
  },
  {
    question: "¿Sirve para convertir unidades?",
    answer: "Sí, aunque para conversiones de unidades estándar (longitud, peso, temperatura...) es más rápido usar nuestro convertidor de unidades dedicado.",
  },
];

export default function CalcReglaDeTresPage() {
  return (
    <ToolPageShell
      toolId="calc-regla-de-tres"
      toolName="Calculadora de Regla de Tres"
      eyebrow="Calculadoras"
      intro="Resuelve reglas de tres directas e inversas: A es a B como C es a X, al instante."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <RuleOfThreeCalculator />
    </ToolPageShell>
  );
}
