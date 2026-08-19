import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { VatCalculator } from "@/components/tools/VatCalculator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Calculadora de IVA Online",
  description:
    "Calcula el IVA de un precio: agrégalo a un precio base o extráelo de un precio que ya lo incluye. Porcentaje personalizable, resultado instantáneo.",
  path: "/calc-iva",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo calcular el IVA" },
  {
    type: "p",
    text: "Para agregar IVA a un precio base: IVA = precio × (porcentaje ÷ 100), y el total es precio + IVA. Para extraer el IVA de un precio que ya lo incluye: base = total ÷ (1 + porcentaje ÷ 100), y el IVA es la diferencia entre el total y esa base.",
  },
  { type: "h2", text: "Por qué el porcentaje es personalizable" },
  {
    type: "p",
    text: "La tasa de IVA (o impuesto al valor agregado equivalente) varía por país — 19%, 16%, 21%, entre otros — así que esta calculadora no asume ninguna tasa fija por defecto más allá de un valor de referencia editable.",
  },
];

const faqItems = [
  {
    question: "¿Cuál es la diferencia entre 'calcular con IVA' y 'calcular sin IVA'?",
    answer:
      "'Calcular con IVA' parte de un precio base (sin impuesto) y te dice cuánto pagarías en total. 'Calcular sin IVA' hace lo contrario: parte de un precio final que ya incluye el impuesto y te dice cuál era el precio base.",
  },
  {
    question: "¿Sirve para cualquier país?",
    answer: "Sí, el porcentaje de IVA es un campo editable — ajusta la tasa según el impuesto de tu país (IVA, GST, VAT, etc.).",
  },
];

export default function CalcIvaPage() {
  return (
    <ToolPageShell
      toolId="calc-iva"
      toolName="Calculadora de IVA"
      eyebrow="Calculadoras"
      intro="Calcula el IVA de un precio, ya sea agregándolo a un precio base o extrayéndolo de un precio que ya lo incluye."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <VatCalculator />
    </ToolPageShell>
  );
}
