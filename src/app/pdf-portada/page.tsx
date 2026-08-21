import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfCoverPage } from "@/components/tools/PdfCoverPage";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Añadir Portada a un PDF Online",
  description: "Añade una imagen como primera página (portada) de un PDF, directamente en tu navegador.",
  path: "/pdf-portada",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube tu PDF y una imagen (JPEG o PNG). La imagen se inserta como una nueva primera página, del mismo tamaño que el resto del documento, centrada y sin recortar.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Añadir una portada con logo a un informe o propuesta",
      "Anteponer una imagen de presentación a un documento antes de compartirlo",
      "Convertir un diseño exportado como imagen en la carátula de un PDF existente",
    ],
  },
];

const faqItems = [
  {
    question: "¿La imagen se recorta para llenar la página?",
    answer:
      "No. La imagen se escala para caber completa dentro de la página (sin recortarla) y queda centrada; si su proporción no coincide con la del documento, puede quedar algo de espacio en blanco a los lados.",
  },
  {
    question: "¿Qué formatos de imagen acepta?",
    answer: "JPEG y PNG.",
  },
  {
    question: "¿Se suben mis archivos a algún servidor?",
    answer: "No. Todo el proceso ocurre en tu navegador; ni el PDF ni la imagen se suben a ningún servidor.",
  },
];

export default function PdfPortadaPage() {
  return (
    <ToolPageShell
      toolId="pdf-portada"
      toolName="Añadir Portada a un PDF"
      eyebrow="PDF"
      intro="Añade una imagen como primera página (portada) de un PDF."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfCoverPage />
    </ToolPageShell>
  );
}
