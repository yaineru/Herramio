import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfGrayscale } from "@/components/tools/PdfGrayscale";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertir PDF a Escala de Grises Online",
  description: "Convierte todas las páginas de un PDF a blanco y negro, ideal para imprimir, directamente en tu navegador.",
  path: "/pdf-escala-grises",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube tu PDF y cada página se convierte a escala de grises. El resultado es un nuevo PDF listo para imprimir en blanco y negro o compartir sin color.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Ahorrar tinta al imprimir un documento que no necesita color",
      "Uniformar el aspecto de un PDF con imágenes de distintos tonos",
      "Preparar un documento para una impresora que solo imprime en blanco y negro",
    ],
  },
];

const faqItems = [
  {
    question: "¿El texto sigue siendo seleccionable después de convertir?",
    answer:
      "No. Cada página se convierte en una imagen en escala de grises para garantizar el resultado, así que el texto deja de ser seleccionable o buscable.",
  },
  {
    question: "¿Se sube mi PDF a algún servidor?",
    answer: "No. La conversión ocurre completamente en tu navegador; el archivo nunca se sube a ningún servidor.",
  },
];

export default function PdfEscalaGrisesPage() {
  return (
    <ToolPageShell
      toolId="pdf-escala-grises"
      toolName="Convertir PDF a Escala de Grises"
      eyebrow="PDF"
      intro="Convierte todas las páginas de un PDF a blanco y negro, ideal para imprimir."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfGrayscale />
    </ToolPageShell>
  );
}
