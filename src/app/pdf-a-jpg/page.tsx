import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfToJpg } from "@/components/tools/PdfToJpg";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Convertir PDF a JPG Online Gratis",
  description:
    "Convierte páginas de un PDF en imágenes JPG directamente en tu navegador. Elige qué páginas convertir y descárgalas de forma individual.",
  path: "/pdf-a-jpg",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo convertir un PDF a JPG" },
  {
    type: "steps",
    items: [
      { title: "Sube tu PDF", text: "La herramienta detecta cuántas páginas tiene." },
      { title: "Elige las páginas", text: "Escribe qué páginas convertir, por ejemplo 1-3,5." },
      { title: "Descarga cada imagen", text: "Cada página se convierte en una imagen JPG descargable por separado." },
    ],
  },
  { type: "h2", text: "Un límite pensado para tu navegador" },
  {
    type: "p",
    text: "Puedes convertir hasta 30 páginas por conversión. Este límite evita que el navegador se sature al renderizar muchas páginas de una vez — para documentos más largos, conviértelos en varios lotes.",
  },
];

const faqItems = [
  {
    question: "¿En qué calidad se generan las imágenes?",
    answer: "Cada página se renderiza al doble de resolución estándar, suficiente para impresión y visualización en pantalla.",
  },
  {
    question: "¿Se sube mi PDF a un servidor?",
    answer: "No. La conversión ocurre completamente en tu navegador.",
  },
];

export default function PdfAJpgPage() {
  return (
    <ToolPageShell
      toolId="pdf-a-jpg"
      toolName="PDF a JPG"
      eyebrow="PDF"
      intro="Convierte las páginas de un PDF en imágenes JPG, eligiendo cuáles convertir, sin subir tu documento a un servidor."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfToJpg />
    </ToolPageShell>
  );
}
