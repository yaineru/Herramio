import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfPageRemover } from "@/components/tools/PdfPageRemover";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Eliminar Páginas de un PDF Online",
  description:
    "Quita páginas específicas de un PDF y descarga el resultado al instante, directamente en tu navegador.",
  path: "/pdf-eliminar-paginas",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Indica qué páginas quieres quitar (por número o por rango, como \"2,4-5\") y la herramienta genera un PDF nuevo con el resto de las páginas en su mismo orden original.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Quitar una página en blanco o mal escaneada de un documento",
      "Eliminar una portada, anexo o página irrelevante antes de compartir un PDF",
      "Reducir un PDF largo a solo las páginas que necesitas",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se sube mi PDF a algún servidor?",
    answer: "No. Las páginas se eliminan completamente en tu navegador; el archivo nunca se sube a ningún servidor.",
  },
  {
    question: "¿Puedo eliminar varias páginas a la vez?",
    answer: "Sí, escribe los números separados por comas o usa rangos, por ejemplo \"2,4-5\" elimina la página 2 y de la 4 a la 5.",
  },
  {
    question: "¿Puedo eliminar todas las páginas del PDF?",
    answer: "No, la herramienta requiere que quede al menos una página en el documento resultante.",
  },
];

export default function PdfEliminarPaginasPage() {
  return (
    <ToolPageShell
      toolId="pdf-eliminar-paginas"
      toolName="Eliminar Páginas de PDF"
      eyebrow="PDF"
      intro="Quita páginas específicas de un PDF y descarga el resultado al instante."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfPageRemover />
    </ToolPageShell>
  );
}
