import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfPageReorder } from "@/components/tools/PdfPageReorder";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Reordenar y Duplicar Páginas de un PDF",
  description:
    "Cambia el orden de las páginas de un PDF o duplica alguna, directamente en tu navegador, sin herramientas externas.",
  path: "/pdf-reordenar-paginas",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Escribe el nuevo orden de las páginas separadas por comas (por ejemplo \"3,1,2\") y la herramienta reconstruye el PDF en ese orden exacto. Si repites un número, esa página se duplica en el resultado.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Corregir el orden de páginas de un documento escaneado fuera de secuencia",
      "Mover una portada o anexo a otra posición del documento",
      "Duplicar una página (por ejemplo, para insertar una copia en otro punto)",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se sube mi PDF a algún servidor?",
    answer: "No. El reordenamiento ocurre completamente en tu navegador; el archivo nunca se sube a ningún servidor.",
  },
  {
    question: "¿Puedo omitir páginas al reordenar?",
    answer: "Sí, si no incluyes un número de página en la lista, esa página simplemente no aparece en el resultado.",
  },
  {
    question: "¿Cómo duplico una página?",
    answer: "Escribe su número más de una vez en el orden, por ejemplo \"1,2,2,3\" duplica la página 2.",
  },
];

export default function PdfReordenarPaginasPage() {
  return (
    <ToolPageShell
      toolId="pdf-reordenar-paginas"
      toolName="Reordenar y Duplicar Páginas de PDF"
      eyebrow="PDF"
      intro="Cambia el orden de las páginas de un PDF o duplica alguna, sin herramientas externas."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfPageReorder />
    </ToolPageShell>
  );
}
