import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { JpgToPdf } from "@/components/tools/JpgToPdf";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertir JPG a PDF Online Gratis",
  description:
    "Convierte una o varias imágenes JPG o PNG en un solo archivo PDF, en el orden que elijas, directamente en tu navegador.",
  path: "/jpg-a-pdf",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo convertir imágenes a PDF" },
  {
    type: "steps",
    items: [
      { title: "Sube tus imágenes", text: "Una o varias, en formato JPG o PNG." },
      { title: "Ordénalas", text: "Cada imagen se convierte en una página, en el orden que definas." },
      { title: "Descarga el PDF", text: "Obtén un solo archivo PDF listo para compartir o imprimir." },
    ],
  },
];

const faqItems = [
  {
    question: "¿Puedo convertir varias imágenes en un solo PDF?",
    answer: "Sí, cada imagen se convierte en una página independiente dentro del mismo archivo PDF, en el orden que elijas.",
  },
  {
    question: "¿Se suben mis imágenes a un servidor?",
    answer: "No. La conversión ocurre completamente en tu navegador.",
  },
];

export default function JpgAPdfPage() {
  return (
    <ToolPageShell
      toolId="jpg-a-pdf"
      toolName="JPG a PDF"
      eyebrow="PDF"
      intro="Convierte una o varias imágenes JPG o PNG en un solo archivo PDF, sin subir nada a un servidor."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <JpgToPdf />
    </ToolPageShell>
  );
}
