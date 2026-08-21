import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { PdfMetadataViewer } from "@/components/tools/PdfMetadataViewer";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Eliminar Metadata de un PDF (Autor, Título, Software)",
  description:
    "Descubre qué metadata oculta tiene tu PDF (autor, título, programa que lo creó) y elimínala, directamente en tu navegador.",
  path: "/pdf-eliminar-metadata",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Qué es la metadata de un PDF" },
  {
    type: "p",
    text: "Todo PDF guarda, además de su contenido visible, un conjunto de propiedades ocultas: quién lo creó, con qué programa, el título del documento y más. Esta herramienta te muestra esos datos y te permite eliminarlos.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Comprobar si un PDF revela tu nombre real o el de tu empresa antes de compartirlo",
      "Eliminar el rastro del programa con el que se generó un documento",
      "Limpiar un PDF antes de subirlo a un sitio público o enviarlo a un desconocido",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se sube mi PDF a algún servidor?",
    answer: "No. La lectura y eliminación de metadata ocurren completamente en tu navegador; el archivo nunca se sube a ningún servidor.",
  },
  {
    question: "¿Esto elimina el contenido del PDF?",
    answer: "No, solo elimina las propiedades del documento (autor, título, etc.). El contenido de las páginas no se modifica.",
  },
];

export default function PdfEliminarMetadataPage() {
  return (
    <ToolPageShell
      toolId="pdf-eliminar-metadata"
      toolName="Eliminar Metadata de PDF"
      eyebrow="PDF"
      intro="Descubre qué metadata oculta (autor, título, programa) tiene tu PDF y elimínala."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <PdfMetadataViewer />
    </ToolPageShell>
  );
}
