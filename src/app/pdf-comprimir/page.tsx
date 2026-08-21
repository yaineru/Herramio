import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfCompressor } from "@/components/tools/PdfCompressor";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Comprimir PDF Online Gratis",
  description:
    "Reduce el peso de un PDF recomprimiendo sus páginas como imágenes, ideal para PDFs escaneados o con muchas fotos, directamente en tu navegador.",
  path: "/pdf-comprimir",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Cada página del PDF se convierte en una imagen y se recomprime al nivel de calidad que elijas, y luego se reconstruye un PDF nuevo con esas imágenes. Es el mismo enfoque que usan muchos compresores online para PDFs escaneados o con muchas fotos, donde la mayor parte del peso proviene de las imágenes.",
  },
  {
    type: "p",
    text: "Importante: como cada página se convierte en imagen, el texto del PDF resultante deja de ser seleccionable. Si tu PDF es principalmente texto (por ejemplo, generado desde Word), esta herramienta no es la más adecuada — funciona mejor con documentos escaneados o con muchas imágenes.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Reducir el peso de un PDF escaneado antes de enviarlo por correo",
      "Achicar un PDF con muchas fotos para subirlo a un formulario con límite de tamaño",
      "Comparar el tamaño antes y después con distintos niveles de compresión",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se sube mi PDF a algún servidor?",
    answer: "No. La compresión ocurre completamente en tu navegador; el archivo nunca se sube a ningún servidor.",
  },
  {
    question: "¿El texto sigue siendo seleccionable después de comprimir?",
    answer: "No. Cada página se convierte en una imagen comprimida, así que el resultado ya no tiene texto seleccionable. Es un PDF de solo imagen, más liviano.",
  },
  {
    question: "¿Cuántas páginas admite?",
    answer: "Hasta 40 páginas por archivo, para mantener el procesamiento rápido en el navegador.",
  },
];

export default function PdfComprimirPage() {
  return (
    <ToolPageShell
      toolId="pdf-comprimir"
      toolName="Comprimir PDF"
      eyebrow="PDF"
      intro="Reduce el peso de un PDF recomprimiendo sus páginas como imágenes, ideal para escaneados."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfCompressor />
    </ToolPageShell>
  );
}
