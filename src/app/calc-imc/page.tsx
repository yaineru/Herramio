import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { BmiCalculator } from "@/components/tools/BmiCalculator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Calculadora de IMC (Índice de Masa Corporal)",
  description:
    "Calcula tu índice de masa corporal (IMC) gratis a partir de tu peso y altura. Resultado instantáneo con la categoría correspondiente.",
  path: "/calc-imc",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo se calcula el IMC" },
  {
    type: "p",
    text: "El índice de masa corporal se calcula dividiendo el peso (en kilogramos) entre la altura (en metros) elevada al cuadrado: IMC = peso ÷ altura². Es la fórmula estándar usada internacionalmente como referencia rápida.",
  },
  { type: "h2", text: "Rangos de categoría" },
  {
    type: "ul",
    items: [
      "Menos de 18.5 — Bajo peso",
      "18.5 a 24.9 — Peso normal",
      "25 a 29.9 — Sobrepeso",
      "30 o más — Obesidad",
    ],
  },
  { type: "h2", text: "Limitaciones del IMC" },
  {
    type: "p",
    text: "El IMC no distingue entre masa muscular y grasa corporal, por lo que puede no ser preciso para personas muy musculosas, deportistas de alto rendimiento, personas mayores o durante el embarazo. Es un indicador orientativo general, no un diagnóstico médico individual.",
  },
];

const faqItems = [
  {
    question: "¿El IMC es igual para hombres y mujeres?",
    answer:
      "La fórmula matemática es la misma, aunque algunos profesionales de salud consideran el sexo, la edad y la composición corporal al interpretar el resultado en un contexto clínico.",
  },
  {
    question: "¿Un IMC alto siempre significa exceso de grasa corporal?",
    answer:
      "No necesariamente. El IMC no mide grasa corporal directamente, solo la relación entre peso y altura, así que puede sobreestimar el riesgo en personas con mucha masa muscular.",
  },
  {
    question: "¿Mis datos se guardan en algún lugar?",
    answer: "No. El cálculo ocurre completamente en tu navegador; no almacenamos ningún dato de salud.",
  },
];

export default function CalcImcPage() {
  return (
    <ToolPageShell
      toolId="calc-imc"
      toolName="Calculadora de IMC"
      eyebrow="Calculadoras"
      intro="Calcula tu índice de masa corporal a partir de tu peso y altura, con la categoría correspondiente al instante."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <BmiCalculator />
    </ToolPageShell>
  );
}
