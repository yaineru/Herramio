import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ColorPaletteExtractor } from "@/components/tools/ColorPaletteExtractor";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Extractor de Paleta de Colores desde una Imagen",
  description:
    "Sube una imagen y obtén al instante sus colores dominantes en HEX, listos para copiar, directamente en tu navegador.",
  path: "/imagen-paleta-colores",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo se extrae la paleta" },
  {
    type: "p",
    text: "La herramienta analiza los píxeles de la imagen, agrupa los tonos similares y muestra los colores que más se repiten, ordenados de mayor a menor presencia — el mismo principio que usan las herramientas de diseño para generar paletas a partir de una foto.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Sacar la paleta de colores de una foto de inspiración para un diseño",
      "Elegir colores de marca a partir de un logo o una imagen de producto",
      "Encontrar el código HEX exacto de un color que viste en una imagen",
      "Crear una paleta coherente para una presentación o sitio web",
    ],
  },
];

const faqItems = [
  {
    question: "¿Se sube mi imagen a algún servidor?",
    answer: "No. El análisis de color ocurre completamente en tu navegador; la imagen nunca se sube a ningún servidor.",
  },
  {
    question: "¿Cuántos colores muestra la herramienta?",
    answer: "Los 6 colores más representativos de la imagen, ordenados por porcentaje de presencia.",
  },
  {
    question: "¿Puedo copiar los colores directamente?",
    answer: "Sí, haz clic en cualquier color para copiar su código HEX, o usa \"Copiar todos\" para copiar la paleta completa de una vez.",
  },
];

export default function ImagenPaletaColoresPage() {
  return (
    <ToolPageShell
      toolId="imagen-paleta-colores"
      toolName="Extractor de Paleta de Colores"
      eyebrow="Imágenes"
      intro="Sube una imagen y obtén los colores dominantes en HEX, listos para copiar."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ColorPaletteExtractor />
    </ToolPageShell>
  );
}
