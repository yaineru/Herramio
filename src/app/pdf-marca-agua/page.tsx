import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfWatermark } from "@/components/tools/PdfWatermark";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Añadir Marca de Agua a un PDF Online",
  description:
    "Estampa un texto semitransparente en diagonal sobre todas las páginas de un PDF, directamente en tu navegador.",
  path: "/pdf-marca-agua",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Escribe el texto que quieres usar como marca de agua (por ejemplo \"CONFIDENCIAL\" o \"BORRADOR\") y ajusta su opacidad y tamaño. La herramienta lo estampa en diagonal, semitransparente, sobre cada página del documento.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Marcar un contrato o documento como borrador antes de la versión final",
      "Proteger un documento confidencial antes de compartirlo",
      "Identificar de dónde salió una copia de un documento",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se sube mi PDF a algún servidor?",
    answer: "No. La marca de agua se aplica completamente en tu navegador; el archivo nunca se sube a ningún servidor.",
  },
  {
    question: "¿Puedo controlar qué tan visible es la marca de agua?",
    answer: "Sí, ajusta el control de opacidad para hacerla más sutil o más notoria, y el tamaño de letra según el espacio disponible en tus páginas.",
  },
];

export default function PdfMarcaAguaPage() {
  return (
    <ToolPageShell
      toolId="pdf-marca-agua"
      toolName="Añadir Marca de Agua a PDF"
      eyebrow="PDF"
      intro="Estampa un texto semitransparente en diagonal sobre todas las páginas de un PDF."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfWatermark />
    </ToolPageShell>
  );
}
