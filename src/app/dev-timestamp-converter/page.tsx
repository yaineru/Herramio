import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { TimestampConverter } from "@/components/tools/TimestampConverter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertidor de Timestamp Unix a Fecha Online",
  description:
    "Convierte entre timestamp Unix (epoch) y fecha legible en ambas direcciones, gratis y en tu navegador.",
  path: "/dev-timestamp-converter",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Qué es un timestamp Unix" },
  {
    type: "p",
    text: "Un timestamp Unix (o epoch) es el número de segundos (o milisegundos) transcurridos desde el 1 de enero de 1970 a las 00:00:00 UTC. Es el formato estándar para representar fechas en la mayoría de sistemas y APIs.",
  },
  { type: "h2", text: "Casos de uso comunes" },
  {
    type: "ul",
    items: [
      "Convertir el timestamp que devuelve una API a una fecha legible",
      "Obtener el timestamp actual para pruebas o depuración",
      "Convertir una fecha específica a timestamp para usarla en código o consultas",
      "Verificar si un timestamp está en segundos o milisegundos",
    ],
  },
];

const faqItems = [
  {
    question: "¿Cómo sé si mi timestamp está en segundos o milisegundos?",
    answer: "Un timestamp en segundos para fechas actuales tiene 10 dígitos; en milisegundos tiene 13. Selecciona la unidad correcta en el selector para obtener una fecha válida.",
  },
  {
    question: "¿Puedo convertir fechas anteriores a 1970?",
    answer: "Sí, se admiten timestamps negativos, que representan fechas anteriores al 1 de enero de 1970.",
  },
  {
    question: "¿En qué zona horaria se muestra la hora local?",
    answer: "Se usa la zona horaria configurada en tu propio dispositivo, además de mostrar siempre el valor equivalente en UTC.",
  },
];

export default function DevTimestampConverterPage() {
  return (
    <ToolPageShell
      toolId="dev-timestamp-converter"
      toolName="Convertidor de Timestamp Unix"
      eyebrow="Desarrolladores"
      intro="Convierte entre timestamp Unix y fecha legible en ambas direcciones, al instante."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <TimestampConverter />
    </ToolPageShell>
  );
}
