import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { LineSorter } from "@/components/tools/LineSorter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Ordenar Líneas y Eliminar Duplicados Online",
  description:
    "Ordena una lista alfabéticamente, quita líneas duplicadas y líneas vacías al instante, directamente en tu navegador.",
  path: "/texto-ordenar-lineas",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Pega una lista de líneas (nombres, correos, palabras clave...) y elige si quieres ordenarla alfabéticamente, quitar las líneas repetidas o eliminar las líneas vacías. Los tres ajustes se pueden combinar.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Limpiar una lista de correos o nombres pegada de otro documento",
      "Ordenar alfabéticamente una lista de palabras clave o etiquetas",
      "Quitar líneas duplicadas de un archivo de texto o una lista de datos",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se guarda el texto que pego en algún servidor?",
    answer: "No. El procesamiento ocurre completamente en tu navegador; el texto nunca se envía a ningún servidor.",
  },
  {
    question: "¿En qué orden se aplican las opciones?",
    answer: "Primero se quitan las líneas vacías (si lo activas), después los duplicados y por último se ordena — así el resultado es siempre predecible.",
  },
  {
    question: "¿Distingue mayúsculas de minúsculas al eliminar duplicados?",
    answer: "Sí, dos líneas que solo difieren en mayúsculas/minúsculas se consideran distintas.",
  },
];

export default function TextoOrdenarLineasPage() {
  return (
    <ToolPageShell
      toolId="texto-ordenar-lineas"
      toolName="Ordenar y Eliminar Líneas Duplicadas"
      eyebrow="Texto"
      intro="Ordena una lista alfabéticamente, quita duplicados y líneas vacías al instante."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <LineSorter />
    </ToolPageShell>
  );
}
