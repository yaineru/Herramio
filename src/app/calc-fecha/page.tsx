import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { DateDiffCalculator } from "@/components/tools/DateDiffCalculator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Calculadora de Días entre Fechas Online",
  description:
    "Calcula cuántos días, semanas, meses o años hay entre dos fechas, gratis y sin registro.",
  path: "/calc-fecha",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo usar esta calculadora" },
  {
    type: "p",
    text: "Elige una fecha inicial y una fecha final — no importa el orden, la herramienta calcula la diferencia igual. El resultado se muestra tanto en días totales como en un desglose de años, meses y días, y también en semanas.",
  },
  { type: "h2", text: "Casos de uso comunes" },
  {
    type: "ul",
    items: [
      "Calcular cuántos días faltan para un evento o fecha límite",
      "Calcular la duración exacta de un proyecto, contrato o estadía",
      "Saber cuántas semanas han pasado desde una fecha determinada",
      "Verificar el plazo exacto de una garantía, préstamo o periodo de prueba",
    ],
  },
];

const faqItems = [
  {
    question: "¿Importa el orden de las fechas?",
    answer: "No. Si eliges la fecha final antes que la inicial, la calculadora las reordena automáticamente y calcula la diferencia igual.",
  },
  {
    question: "¿Se guardan mis fechas en algún servidor?",
    answer: "No. El cálculo ocurre completamente en tu navegador; las fechas nunca se envían a ningún servidor.",
  },
  {
    question: "¿Por qué el resultado en semanas no es un número exacto de días entre 7?",
    answer: "Sí lo es: se muestran las semanas completas más los días restantes por separado (por ejemplo, \"51 semanas y 1 día\"), para que el total en días siga siendo exacto.",
  },
  {
    question: "¿Cuenta el día de inicio, el día final, o ambos?",
    answer: "Cuenta el número de días completos transcurridos entre ambas fechas — por ejemplo, del 1 al 3 de un mes hay 2 días de diferencia, no 3.",
  },
];

export default function CalcFechaPage() {
  return (
    <ToolPageShell
      toolId="calc-fecha"
      toolName="Calculadora de Diferencia entre Fechas"
      eyebrow="Calculadoras"
      intro="Calcula cuántos días, semanas, meses o años hay entre dos fechas."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <DateDiffCalculator />
    </ToolPageShell>
  );
}
