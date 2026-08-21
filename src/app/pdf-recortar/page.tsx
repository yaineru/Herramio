import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfCropper } from "@/components/tools/PdfCropper";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Recortar Márgenes de un PDF Online",
  description:
    "Recorta los márgenes blancos de un PDF ajustando el área visible de cada página, directamente en tu navegador.",
  path: "/pdf-recortar",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube tu PDF y ajusta cuánto margen quieres quitar de cada lado (superior, inferior, izquierdo, derecho) como porcentaje del tamaño de cada página. La herramienta actualiza el área visible del documento sin volver a dibujar el contenido.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Quitar márgenes excesivos antes de imprimir un documento",
      "Preparar un PDF para insertarlo en una presentación sin espacio en blanco de sobra",
      "Ajustar un PDF escaneado con bordes irregulares",
    ],
  },
];

const faqItems = [
  {
    question: "¿El recorte borra contenido del PDF?",
    answer:
      "No. El recorte ajusta el área visible e imprimible de cada página (su \"crop box\"); el contenido original sigue presente, solo queda fuera del área que se muestra.",
  },
  {
    question: "¿Puedo usar márgenes distintos por página?",
    answer: "No, el mismo porcentaje de margen se aplica a todas las páginas del documento.",
  },
  {
    question: "¿Se sube mi PDF a algún servidor?",
    answer: "No. El recorte ocurre completamente en tu navegador; el archivo nunca se sube a ningún servidor.",
  },
];

export default function PdfRecortarPage() {
  return (
    <ToolPageShell
      toolId="pdf-recortar"
      toolName="Recortar Márgenes de PDF"
      eyebrow="PDF"
      intro="Recorta los márgenes blancos de un PDF ajustando el área visible de cada página."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfCropper />
    </ToolPageShell>
  );
}
