import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfPageNumberer } from "@/components/tools/PdfPageNumberer";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Numerar Páginas de un PDF Online",
  description:
    "Añade números de página a un PDF, con la posición y el número inicial que elijas, directamente en tu navegador.",
  path: "/pdf-numerar-paginas",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Elige dónde quieres que aparezca el número en cada página (abajo centrado, abajo a la derecha o arriba a la derecha) y desde qué número empezar. La herramienta añade el número en cada página del documento.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Añadir numeración a un documento antes de imprimirlo o entregarlo",
      "Numerar un informe, tesis o manual que no la traía originalmente",
      "Continuar la numeración desde un número específico (por ejemplo, si es la segunda parte de un documento)",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se sube mi PDF a algún servidor?",
    answer: "No. La numeración se añade completamente en tu navegador; el archivo nunca se sube a ningún servidor.",
  },
  {
    question: "¿Puedo empezar la numeración en un número distinto de 1?",
    answer: "Sí, escribe el número inicial que quieras y la numeración continuará de forma consecutiva desde ahí.",
  },
];

export default function PdfNumerarPaginasPage() {
  return (
    <ToolPageShell
      toolId="pdf-numerar-paginas"
      toolName="Numerar Páginas de PDF"
      eyebrow="PDF"
      intro="Añade números de página a un PDF, con la posición y el número inicial que elijas."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfPageNumberer />
    </ToolPageShell>
  );
}
