import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfSplitter } from "@/components/tools/PdfSplitter";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Dividir PDF Online Gratis",
  description:
    "Extrae páginas específicas de un PDF y descárgalas como archivos independientes, directamente en tu navegador.",
  path: "/pdf-dividir",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo dividir un PDF" },
  {
    type: "steps",
    items: [
      { title: "Sube tu PDF", text: "La herramienta detecta automáticamente cuántas páginas tiene." },
      { title: "Define los rangos", text: "Escribe los grupos de páginas separados por comas, ej. 1-3,5,8-10." },
      { title: "Descarga cada parte", text: "Cada grupo se convierte en un PDF independiente y descargable." },
    ],
  },
  { type: "h2", text: "Ejemplo" },
  {
    type: "p",
    text: "Si escribes \"1-3,4-6\", obtendrás dos archivos: uno con las páginas 1 a 3, y otro con las páginas 4 a 6 — útil para separar capítulos o secciones de un mismo documento.",
  },
];

const faqItems = [
  {
    question: "¿Puedo extraer una sola página?",
    answer: "Sí, escribe solo el número de esa página (por ejemplo \"5\") para obtenerla como un PDF de una sola página.",
  },
  {
    question: "¿Se sube mi PDF a un servidor?",
    answer: "No. La división ocurre completamente en tu navegador.",
  },
];

export default function PdfDividirPage() {
  return (
    <ToolPageShell
      toolId="pdf-dividir"
      toolName="Dividir PDF"
      eyebrow="PDF"
      intro="Extrae páginas específicas de un PDF y descárgalas como archivos independientes, sin subir tu documento a un servidor."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfSplitter />
    </ToolPageShell>
  );
}
