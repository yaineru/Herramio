import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfBlankPageRemover } from "@/components/tools/PdfBlankPageRemover";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Eliminar Páginas en Blanco de un PDF",
  description: "Detecta y elimina automáticamente las páginas en blanco de un PDF escaneado, directamente en tu navegador.",
  path: "/pdf-eliminar-paginas-blancas",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube tu PDF y la herramienta analiza cada página buscando cuáles están completamente en blanco (sin ningún píxel con tinta). Las páginas en blanco detectadas se eliminan automáticamente del documento.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Limpiar un PDF escaneado desde una fotocopiadora que suele agregar hojas vacías",
      "Reducir el número de páginas antes de compartir o imprimir un documento",
      "Preparar un documento escaneado para archivarlo sin páginas de relleno",
    ],
  },
];

const faqItems = [
  {
    question: "¿Cómo detecta qué página está en blanco?",
    answer:
      "Renderiza cada página como imagen y revisa si todos sus píxeles son prácticamente blancos. Una página con una marca de agua muy tenue o un punto de tinta aislado podría no detectarse como en blanco.",
  },
  {
    question: "¿Qué pasa si todas las páginas están en blanco?",
    answer: "La herramienta no elimina nada en ese caso, para evitar dejarte con un PDF vacío.",
  },
  {
    question: "¿Se sube mi PDF a algún servidor?",
    answer: "No. El análisis y la eliminación ocurren completamente en tu navegador.",
  },
];

export default function PdfEliminarPaginasBlancasPage() {
  return (
    <ToolPageShell
      toolId="pdf-eliminar-paginas-blancas"
      toolName="Eliminar Páginas en Blanco de un PDF"
      eyebrow="PDF"
      intro="Detecta y elimina automáticamente las páginas en blanco de un PDF escaneado."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfBlankPageRemover />
    </ToolPageShell>
  );
}
