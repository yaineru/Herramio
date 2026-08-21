import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfMergeWithImages } from "@/components/tools/PdfMergeWithImages";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Combinar PDF con Imágenes Online",
  description: "Combina varios PDF e imágenes, en el orden que quieras, en un solo documento PDF, directamente en tu navegador.",
  path: "/pdf-combinar-con-imagenes",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube cualquier combinación de archivos PDF e imágenes JPEG/PNG, ordénalos con las flechas y combínalos en un solo documento PDF. Cada imagen se convierte automáticamente en una página.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Añadir una foto de un recibo o documento escaneado al final de un PDF existente",
      "Armar un expediente mezclando contratos en PDF con fotos de evidencia",
      "Combinar capturas de pantalla con un informe en PDF",
    ],
  },
];

const faqItems = [
  {
    question: "¿En qué se diferencia de Unir PDF?",
    answer: "Unir PDF solo combina archivos PDF. Esta herramienta acepta también imágenes JPEG y PNG, convirtiéndolas en páginas dentro del mismo documento.",
  },
  {
    question: "¿Puedo reordenar los archivos después de subirlos?",
    answer: "Sí, usa las flechas junto a cada archivo para moverlo hacia arriba o abajo antes de combinar.",
  },
  {
    question: "¿Se suben mis archivos a algún servidor?",
    answer: "No. Todo el proceso ocurre en tu navegador; ningún archivo se sube a ningún servidor.",
  },
];

export default function PdfCombinarConImagenesPage() {
  return (
    <ToolPageShell
      toolId="pdf-combinar-con-imagenes"
      toolName="Combinar PDF con Imágenes"
      eyebrow="PDF"
      intro="Combina varios PDF e imágenes, en el orden que quieras, en un solo documento PDF."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfMergeWithImages />
    </ToolPageShell>
  );
}
