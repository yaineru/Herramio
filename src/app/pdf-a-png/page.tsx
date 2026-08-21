import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfToPng } from "@/components/tools/PdfToPng";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertir PDF a PNG Online",
  description: "Convierte cada página de un PDF en una imagen PNG sin pérdida de calidad, directamente en tu navegador.",
  path: "/pdf-a-png",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube tu PDF, elige qué páginas quieres exportar y cada una se convierte en una imagen PNG independiente, lista para descargar por separado.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Exportar diagramas o capturas de un PDF con texto nítido y sin artefactos de compresión",
      "Obtener una imagen con fondo transparente cuando la página del PDF lo tiene",
      "Insertar una página de un PDF en un editor de diseño que necesita PNG",
    ],
  },
];

const faqItems = [
  {
    question: "¿En qué se diferencia de convertir a JPG?",
    answer:
      "El PNG no pierde calidad al comprimir (a diferencia del JPG) y puede conservar transparencia, pero el archivo resultante suele pesar más. Úsalo cuando la nitidez importe más que el tamaño.",
  },
  {
    question: "¿Hay un límite de páginas?",
    answer: "Puedes convertir hasta 30 páginas por conversión para no saturar el navegador.",
  },
  {
    question: "¿Se sube mi PDF a algún servidor?",
    answer: "No. La conversión ocurre completamente en tu navegador; el archivo nunca se sube a ningún servidor.",
  },
];

export default function PdfAPngPage() {
  return (
    <ToolPageShell
      toolId="pdf-a-png"
      toolName="Convertir PDF a PNG"
      eyebrow="PDF"
      intro="Convierte cada página de un PDF en una imagen PNG sin pérdida de calidad."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfToPng />
    </ToolPageShell>
  );
}
