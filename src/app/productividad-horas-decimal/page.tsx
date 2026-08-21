import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { HoursDecimalConverter } from "@/components/tools/HoursDecimalConverter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertidor de Horas a Decimal Online",
  description:
    "Convierte horas y minutos a formato decimal y suma varias jornadas, ideal para hojas de horas y nóminas.",
  path: "/productividad-horas-decimal",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Escribe horas y minutos (por ejemplo, 8 horas y 30 minutos) y la herramienta los convierte a formato decimal (8.5). Puedes añadir varias filas para sumar el total de varias jornadas o tareas de una vez.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Convertir horas trabajadas a decimal para cargarlas en un sistema de nómina",
      "Sumar el tiempo de varias tareas o jornadas registradas en HH:MM",
      "Calcular cuánto cobrar por hora cuando el tiempo está en formato HH:MM",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se guardan mis datos en algún servidor?",
    answer: "No. La conversión ocurre completamente en tu navegador; los datos nunca se envían a ningún servidor.",
  },
  {
    question: "¿Por qué 8:30 equivale a 8.5 y no a 8.30?",
    answer: "Porque 30 minutos son la mitad de una hora (30/60 = 0.5), no una fracción decimal directa de los minutos.",
  },
  {
    question: "¿Puedo sumar varias jornadas a la vez?",
    answer: "Sí, añade una fila por cada jornada o tarea y la herramienta suma automáticamente el total en decimal.",
  },
];

export default function ProductividadHorasDecimalPage() {
  return (
    <ToolPageShell
      toolId="productividad-horas-decimal"
      toolName="Convertidor de Horas a Decimal"
      eyebrow="Productividad"
      intro="Convierte horas y minutos a formato decimal y suma varias jornadas."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <HoursDecimalConverter />
    </ToolPageShell>
  );
}
