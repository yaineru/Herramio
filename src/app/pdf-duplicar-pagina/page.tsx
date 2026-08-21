import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfDuplicatePage } from "@/components/tools/PdfDuplicatePage";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Duplicar Página de un PDF Online",
  description: "Duplica una página específica de un PDF, insertando la copia justo después, directamente en tu navegador.",
  path: "/pdf-duplicar-pagina",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube tu PDF, elige qué página quieres duplicar y la copia se inserta automáticamente justo después de la original, sin alterar el resto del documento.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Repetir una plantilla o formato dentro de un mismo documento",
      "Crear una copia editable de una página antes de modificarla en otra herramienta",
      "Duplicar una carátula o sección que se repite en un informe",
    ],
  },
];

const faqItems = [
  {
    question: "¿Puedo duplicar más de una página a la vez?",
    answer: "Esta herramienta duplica una página por vez. Para duplicar varias, repite el proceso sobre el resultado.",
  },
  {
    question: "¿Se sube mi PDF a algún servidor?",
    answer: "No. El proceso ocurre completamente en tu navegador; el archivo nunca se sube a ningún servidor.",
  },
];

export default function PdfDuplicarPaginaPage() {
  return (
    <ToolPageShell
      toolId="pdf-duplicar-pagina"
      toolName="Duplicar Página de un PDF"
      eyebrow="PDF"
      intro="Duplica una página específica de un PDF, insertando la copia justo después."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfDuplicatePage />
    </ToolPageShell>
  );
}
