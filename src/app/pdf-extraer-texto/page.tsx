import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfTextExtractor } from "@/components/tools/PdfTextExtractor";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Extraer Texto de un PDF Online",
  description:
    "Extrae todo el texto de un PDF y cópialo o descárgalo como archivo .txt, directamente en tu navegador.",
  path: "/pdf-extraer-texto",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Esta herramienta lee la capa de texto real de cada página del PDF, en el mismo orden en que aparece en el documento. Funciona con cualquier PDF que tenga texto seleccionable — no realiza reconocimiento óptico de caracteres (OCR), así que un PDF escaneado sin capa de texto no producirá resultados.",
  },
  { type: "h2", text: "Qué puedes hacer con el resultado" },
  {
    type: "ul",
    items: [
      "Copiar todo el texto extraído al portapapeles",
      "Descargarlo como archivo .txt",
    ],
  },
  { type: "h2", text: "Cuándo se usa" },
  {
    type: "ul",
    items: [
      "Copiar rápido el contenido de un PDF sin seleccionar texto manualmente página por página",
      "Reutilizar el texto de un contrato, artículo o informe en otro documento",
      "Comprobar si un PDF tiene texto seleccionable o es solo una imagen escaneada",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se sube mi PDF a algún servidor?",
    answer: "No. El texto se extrae completamente en tu navegador; el archivo nunca se sube a ningún servidor.",
  },
  {
    question: "¿Funciona con PDFs escaneados?",
    answer: "No directamente. Esta herramienta lee la capa de texto real del PDF, no realiza OCR. Un PDF escaneado sin texto seleccionable no producirá resultados.",
  },
  {
    question: "¿Se conserva el formato original (columnas, tablas, saltos de línea)?",
    answer: "El texto se extrae en el orden en que el PDF lo almacena internamente, que no siempre coincide exactamente con el diseño visual, especialmente en documentos con columnas o tablas complejas.",
  },
];

export default function PdfExtraerTextoPage() {
  return (
    <ToolPageShell
      toolId="pdf-extraer-texto"
      toolName="Extraer Texto de PDF"
      eyebrow="PDF"
      intro="Extrae todo el texto de un PDF y cópialo o descárgalo como archivo .txt."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfTextExtractor />
    </ToolPageShell>
  );
}
