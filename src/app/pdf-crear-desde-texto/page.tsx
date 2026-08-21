import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfFromText } from "@/components/tools/PdfFromText";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Crear PDF desde Texto Online",
  description: "Convierte cualquier texto en un documento PDF paginado, listo para descargar, directamente en tu navegador.",
  path: "/pdf-crear-desde-texto",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Escribe o pega tu texto y la herramienta genera un PDF tamaño A4, ajustando automáticamente los saltos de línea y creando nuevas páginas cuando el texto no cabe en una sola.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Convertir notas o un borrador en un documento PDF para compartir",
      "Generar rápidamente un PDF simple sin abrir un procesador de texto",
      "Guardar el resultado de otra herramienta de texto de Herramio como PDF",
    ],
  },
];

const faqItems = [
  {
    question: "¿Puedo darle formato al texto (negritas, colores, tamaños)?",
    answer: "No. Esta herramienta genera un PDF de texto simple, en una sola fuente y tamaño, sin opciones de formato enriquecido.",
  },
  {
    question: "¿Hay un límite de texto?",
    answer: "Puedes escribir hasta 50.000 caracteres; el PDF se pagina automáticamente según haga falta.",
  },
  {
    question: "¿Se envía mi texto a algún servidor?",
    answer: "No. El PDF se genera completamente en tu navegador.",
  },
];

export default function PdfCrearDesdeTextoPage() {
  return (
    <ToolPageShell
      toolId="pdf-crear-desde-texto"
      toolName="Crear PDF desde Texto"
      eyebrow="PDF"
      intro="Convierte cualquier texto en un documento PDF paginado, listo para descargar."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfFromText />
    </ToolPageShell>
  );
}
