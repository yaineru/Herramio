import type { Metadata } from "next";
import { ToolPageShell } from "@/components/marketing/ToolPageShell";
import { ImageCollage } from "@/components/tools/ImageCollage";
import { buildMetadata } from "@/lib/seo";
import type { ContentBlock } from "@/lib/blog/types";

export const metadata: Metadata = buildMetadata({
  title: "Crear Collage de Fotos Online",
  description: "Combina de 2 a 4 imágenes en un solo collage en cuadrícula, directamente en tu navegador.",
  path: "/imagen-collage",
});

const seoContent: ContentBlock[] = [
  { type: "h2", text: "Cómo funciona" },
  {
    type: "p",
    text: "Sube entre 2 y 4 imágenes. La herramienta las acomoda automáticamente en una cuadrícula pareja (recortando cada una al centro para que encajen) y genera un collage listo para descargar.",
  },
  { type: "h2", text: "Para qué se usa" },
  {
    type: "ul",
    items: [
      "Armar un collage rápido de fotos de un evento para compartir en redes",
      "Combinar capturas de pantalla en una sola imagen antes de enviarlas",
      "Crear una imagen de antes/después con dos fotos",
    ],
  },
];

const faqItems = [
  {
    question: "¿Puedo elegir el orden de las imágenes?",
    answer: "Se colocan en el orden en que las subes; puedes quitar una imagen y volver a añadirla para reordenarla.",
  },
  {
    question: "¿Las imágenes se recortan?",
    answer: "Sí, cada imagen se recorta al centro para llenar su celda de la cuadrícula sin deformarse.",
  },
  {
    question: "¿Se suben mis imágenes a algún servidor?",
    answer: "No. El collage se genera completamente en tu navegador; ninguna imagen se sube a ningún servidor.",
  },
];

export default function ImagenCollagePage() {
  return (
    <ToolPageShell
      toolId="imagen-collage"
      toolName="Crear Collage de Fotos"
      eyebrow="Imágenes"
      intro="Combina de 2 a 4 imágenes en un solo collage en cuadrícula."
      seoContent={seoContent}
      faqItems={faqItems}
    >
      <ImageCollage />
    </ToolPageShell>
  );
}
