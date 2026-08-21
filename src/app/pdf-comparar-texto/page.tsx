import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfTextComparer } from "@/components/tools/PdfTextComparer";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Comparar Texto de Dos PDF Online",
  description:
    "Compara el texto de dos versiones de un PDF y resalta lo que se agregó o se quitó, directamente en tu navegador.",
  path: "/pdf-comparar-texto",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube dos PDF (por ejemplo, un contrato y su versión revisada). La herramienta extrae el texto real de cada uno y compara palabra por palabra, mostrando en verde lo que se agregó y en rojo lo que se eliminó.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Revisar qué cambió entre dos versiones de un contrato o acuerdo",
      "Verificar que una corrección editorial no alteró nada más del texto",
      "Comparar dos borradores de un documento antes de firmarlo",
    ],
  },
];

const faqItems = [
  {
    question: "¿Compara el diseño o solo el texto?",
    answer:
      "Solo el texto. No compara diseño, imágenes, fuentes ni formato — únicamente el contenido de texto real que cada PDF contiene.",
  },
  {
    question: "¿Funciona con PDF escaneados?",
    answer:
      "No, si el PDF es una imagen escaneada sin texto real, no hay texto que extraer ni comparar. Funciona con PDF generados digitalmente (Word, Google Docs, etc.).",
  },
  {
    question: "¿Se suben mis PDF a algún servidor?",
    answer: "No. Ambos documentos se procesan completamente en tu navegador; nunca se suben a ningún servidor.",
  },
];

export default function PdfCompararTextoPage() {
  return (
    <ToolPageShell
      toolId="pdf-comparar-texto"
      toolName="Comparar Texto de Dos PDF"
      eyebrow="PDF"
      intro="Compara el texto de dos PDF y resalta lo que se agregó o se quitó entre versiones."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfTextComparer />
    </ToolPageShell>
  );
}
