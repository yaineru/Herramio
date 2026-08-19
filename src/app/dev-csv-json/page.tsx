import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { CsvJsonConverter } from "@/components/tools/CsvJsonConverter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertidor de CSV a JSON (y JSON a CSV) Online",
  description:
    "Convierte de CSV a JSON y de JSON a CSV gratis, en tu navegador. Soporta campos con comas y comillas.",
  path: "/dev-csv-json",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "La primera fila del CSV se toma como encabezado (los nombres de las columnas); cada fila siguiente se convierte en un objeto JSON con esas claves. En sentido contrario, cada objeto de un array JSON se convierte en una fila, usando la unión de todas las claves como encabezado.",
  },
  { type: "h2", text: "Casos de uso comunes" },
  {
    type: "ul",
    items: [
      "Convertir una exportación de Excel/Google Sheets (CSV) a JSON para usar en código",
      "Convertir una respuesta de API (JSON) a CSV para abrir en una hoja de cálculo",
      "Depurar rápidamente el contenido de un CSV con campos complejos (comas, comillas)",
    ],
  },
];

const faqItems = [
  {
    question: "¿Soporta campos con comas o saltos de línea dentro de las comillas?",
    answer: "Sí, el parser interpreta correctamente campos entre comillas dobles que contienen comas, saltos de línea o comillas escapadas (\"\").",
  },
  {
    question: "¿Qué pasa si una fila tiene menos columnas que el encabezado?",
    answer: "Las columnas faltantes se completan con un valor vacío, para que el JSON resultante sea siempre válido.",
  },
  {
    question: "¿Se procesa el archivo en algún servidor?",
    answer: "No. Todo el procesamiento ocurre en tu navegador; el contenido nunca se envía a ningún servidor.",
  },
];

export default function DevCsvJsonPage() {
  return (
    <ToolPageShell
      toolId="dev-csv-json"
      toolName="Convertidor CSV / JSON"
      eyebrow="Desarrolladores"
      intro="Convierte de CSV a JSON y de JSON a CSV al instante, directamente en tu navegador."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <CsvJsonConverter />
    </ToolPageShell>
  );
}
