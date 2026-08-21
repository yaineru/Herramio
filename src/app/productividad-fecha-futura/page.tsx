import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { DateOffsetTool } from "@/components/tools/DateOffsetTool";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Calcular Fecha Futura o Pasada Online",
  description:
    "Suma o resta días, semanas, meses o años a una fecha y descubre el resultado al instante, directamente en tu navegador.",
  path: "/productividad-fecha-futura",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Elige una fecha de inicio, cuántas unidades quieres sumar o restar (días, semanas, meses o años) y la herramienta calcula la fecha resultante al instante.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Saber qué fecha será dentro de 45, 90 o 180 días",
      "Calcular la fecha de vencimiento de un plazo legal o contractual",
      "Saber qué fecha fue hace un número exacto de semanas o meses",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se guardan mis datos en algún servidor?",
    answer: "No. El cálculo ocurre completamente en tu navegador.",
  },
  {
    question: "¿Tiene en cuenta los años bisiestos?",
    answer: "Sí, el cálculo se basa en las fechas reales del calendario, incluyendo años bisiestos.",
  },
];

export default function ProductividadFechaFuturaPage() {
  return (
    <ToolPageShell
      toolId="productividad-fecha-futura"
      toolName="Calcular Fecha Futura o Pasada"
      eyebrow="Productividad"
      intro="Suma o resta días, semanas, meses o años a una fecha y descubre el resultado al instante."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <DateOffsetTool />
    </ToolPageShell>
  );
}
