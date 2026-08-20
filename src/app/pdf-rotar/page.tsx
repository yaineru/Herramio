import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfRotator } from "@/components/tools/PdfRotator";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Rotar PDF Online Gratis",
  description:
    "Rota todas las páginas de un PDF o solo las que elijas, en 90°, 180° o 270°, directamente en tu navegador.",
  path: "/pdf-rotar",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Elige si quieres rotar todas las páginas del PDF o solo algunas específicas, define el ángulo de rotación y descarga el documento corregido. La rotación se suma a la que ya tuviera cada página, así que también sirve para corregir un escaneo torcido.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Corregir páginas escaneadas al revés o de lado",
      "Rotar solo unas pocas páginas mezcladas con orientación distinta al resto",
      "Girar un PDF completo antes de imprimirlo o compartirlo",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se sube mi PDF a algún servidor?",
    answer: "No. La rotación se aplica completamente en tu navegador; el archivo nunca se sube a ningún servidor.",
  },
  {
    question: "¿Puedo rotar solo algunas páginas y dejar el resto igual?",
    answer: "Sí, elige \"Páginas específicas\" e indica los números o rangos que quieras rotar; el resto del documento no se modifica.",
  },
  {
    question: "¿Qué pasa si una página ya estaba rotada?",
    answer: "La nueva rotación se suma a la que ya tenía, así que puedes seguir rotando la misma página hasta dejarla en la orientación correcta.",
  },
];

export default function PdfRotarPage() {
  return (
    <ToolPageShell
      toolId="pdf-rotar"
      toolName="Rotar PDF"
      eyebrow="PDF"
      intro="Rota todas las páginas de un PDF o solo las que elijas, en 90°, 180° o 270°."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfRotator />
    </ToolPageShell>
  );
}
