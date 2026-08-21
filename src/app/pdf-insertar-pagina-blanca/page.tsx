import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfBlankPageInserter } from "@/components/tools/PdfBlankPageInserter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Insertar Página en Blanco en un PDF",
  description: "Añade una página en blanco en cualquier posición de un PDF, directamente en tu navegador.",
  path: "/pdf-insertar-pagina-blanca",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube tu PDF, elige en qué posición quieres insertar la página en blanco (por ejemplo, al final o entre las páginas 2 y 3) y descarga el documento actualizado.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Dejar espacio para notas manuscritas entre dos secciones de un documento",
      "Separar capítulos o anexos con una página vacía",
      "Ajustar el número total de páginas antes de imprimir a doble cara",
    ],
  },
];

const faqItems = [
  {
    question: "¿De qué tamaño es la página en blanco?",
    answer: "Del mismo tamaño que la página junto a la que se inserta, para que el documento quede consistente.",
  },
  {
    question: "¿Puedo insertar varias páginas en blanco a la vez?",
    answer: "Esta herramienta inserta una página por vez. Para agregar varias, repite el proceso o vuelve a subir el resultado.",
  },
  {
    question: "¿Se sube mi PDF a algún servidor?",
    answer: "No. El documento se procesa completamente en tu navegador; nunca se sube a ningún servidor.",
  },
];

export default function PdfInsertarPaginaBlancaPage() {
  return (
    <ToolPageShell
      toolId="pdf-insertar-pagina-blanca"
      toolName="Insertar Página en Blanco en PDF"
      eyebrow="PDF"
      intro="Añade una página en blanco en cualquier posición de un PDF."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfBlankPageInserter />
    </ToolPageShell>
  );
}
